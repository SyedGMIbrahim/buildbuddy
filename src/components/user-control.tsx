"use client";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function UserControl() {
  return (
    <div className="flex items-center gap-2">
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10",
              userButtonTrigger: "w-10 h-10",
            },
          }}
        />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button variant="outline">Sign Up</Button>
        </SignUpButton>
      </SignedOut>
    </div>
  );
}
