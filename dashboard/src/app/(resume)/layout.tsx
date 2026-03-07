import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}
