import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | ClienZo"
        description="Create your ClienZo account to get started with lead and appointment management."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
