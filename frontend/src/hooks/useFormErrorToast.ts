import { useEffect, useRef } from "react";
import { FieldErrors } from "react-hook-form";
import { toast } from "sonner";

export function useFormErrorToast(
  errors: FieldErrors,
  message = "Por favor, corrija os erros no formulário",
) {
  const previousErrorsRef = useRef<string>("");

  useEffect(() => {
    const errorKeys = Object.keys(errors);
    const hasErrors = errorKeys.length > 0;

    const currentErrorsKey = errorKeys.sort().join(",");

    if (hasErrors && currentErrorsKey !== previousErrorsRef.current) {
      toast.error(message);
      previousErrorsRef.current = currentErrorsKey;
    }

    if (!hasErrors) {
      previousErrorsRef.current = "";
    }
  }, [errors, message]);
}
