import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FieldApi } from "@tanstack/react-form";
import { signup } from "@/lib/api/auth.api";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

type FormValues = z.infer<typeof registerSchema>;

export const Route = createFileRoute("/register")({
  component: RegisterComponent,
});

function FieldInfo({
  field,
}: {
  //@ts-expect-error
  field: FieldApi<FormValues, keyof FormValues>;
}) {
  return (
    <div className='h-6'>
      {field.state.meta.errorMap.onChange ? (
        <p className='text-xs text-destructive'>
          {field.state.meta.errorMap.onChange.map((err: any) => err.message)}
        </p>
      ) : null}
      {field.state.meta.isValidating ? (
        <p className='text-xs text-muted-foreground'>Validating...</p>
      ) : null}
    </div>
  );
}

function RegisterComponent() {
  //@ts-expect-error
  const form = useForm<FormValues>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value);
      signup(value);
    },
  });

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md p-6 space-y-8 shadow-lg'>
        <div className='space-y-2 text-center'>
          <h1 className='text-3xl font-bold'>Create Account</h1>
          <p className='text-muted-foreground'>
            Enter your information to get started
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className='space-y-6'
        >
          {(["username", "email", "password"] as const).map((name) => (
            <form.Field
              key={name}
              name={name}
              validators={{ onChange: registerSchema.shape[name] }}
              children={(field) => (
                <div className='space-y-2'>
                  <Label htmlFor={field.name}>
                    {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    type={
                      name === "password"
                        ? "password"
                        : name === "email"
                          ? "email"
                          : "text"
                    }
                    aria-invalid={!!field.state.meta.errors.length}
                    className='h-12'
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
          ))}

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type='submit'
                disabled={!canSubmit}
                className='w-full h-12 text-lg'
              >
                {isSubmitting ? (
                  <span className='flex items-center gap-2'>
                    <span className='animate-spin'>↻</span>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            )}
          />
        </form>

        <p className='text-center text-sm text-muted-foreground'>
          Already have an account?{" "}
          <a href='#' className='text-primary hover:underline'>
            Sign in
          </a>
        </p>
      </Card>
    </div>
  );
}
