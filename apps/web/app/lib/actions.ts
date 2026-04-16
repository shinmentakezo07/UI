"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const SignupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

export async function signup(prevState: State, formData: FormData) {
  const validatedFields = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Account.",
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
        return {
            message: "Email already exists.",
        };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return {
      message: "Database Error: Failed to Create Account.",
    };
  }
  
  // Sign in the user immediately after signup
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    console.error("Auto-login error:", error);
  }
  
  redirect("/dashboard");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function authenticateSocial(provider: string) {
    await signIn(provider);
}

export async function forgotPassword(prevState: any, formData: FormData) {
    const email = formData.get("email");
    // Mock logic: In a real app, send an email here.
    // For now, we'll just pretend we did.
    if (!email) return { message: "Email is required" };
    
    // Validate email format
    const emailSchema = z.string().email();
    const result = emailSchema.safeParse(email);
    
    if (!result.success) {
        return { message: "Invalid email address" };
    }

    return { message: "If an account exists, a password reset link has been sent." };
}

export async function signOutAction() {
  "use server";
  await signOut();
}



export async function updateProfile(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
  });

  const validated = schema.safeParse({ name, email });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  try {
    const currentUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!currentUser) return { message: "User not found" };

    if (email !== currentUser.email) {
      const existing = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (existing) {
        return { message: "Email already in use" };
      }
    }

    await db.update(users)
      .set({ name, email })
      .where(eq(users.id, currentUser.id));

    revalidatePath("/dashboard/settings");
    revalidatePath("/", "layout"); 
    return { message: "Profile updated successfully" };
  } catch (e) {
    return { message: "Failed to update profile" };
  }
}

export async function changePassword(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: "Not authenticated" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return { message: "New passwords do not match" };
  }

  if (newPassword.length < 6) {
    return { message: "Password must be at least 6 characters" };
  }

  try {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!userRecord || !userRecord.password) {
      return { message: "User not found or invalid state" };
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, userRecord.password);
    if (!passwordsMatch) {
      return { message: "Incorrect current password" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userRecord.id));

    return { message: "Password updated successfully" };
  } catch (e) {
    return { message: "Failed to update password" };
  }
}
