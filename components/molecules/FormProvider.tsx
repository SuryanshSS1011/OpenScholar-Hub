import React, { createContext, useContext } from 'react';
import { useForm, UseFormReturn, FieldValues, SubmitHandler, DefaultValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface FormContextValue<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
}

const FormContext = createContext<FormContextValue | null>(null);

interface FormProviderProps<T extends FieldValues = FieldValues> {
  children: React.ReactNode;
  schema?: yup.ObjectSchema<any>;
  defaultValues?: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

/**
 * Form Provider component using React Hook Form + Yup validation
 */
function FormProvider<T extends FieldValues = FieldValues>({
  children,
  schema,
  defaultValues,
  onSubmit,
  mode = 'onChange',
}: FormProviderProps<T>) {
  const form = useForm<T>({
    resolver: schema ? yupResolver(schema) : undefined,
    defaultValues,
    mode,
  });

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <FormContext.Provider value={{ form: form as UseFormReturn }}>
      <form onSubmit={handleSubmit} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );
}

/**
 * Hook to access form context
 */
export function useFormContext<T extends FieldValues = FieldValues>() {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  
  return context.form as UseFormReturn<T>;
}

/**
 * Hook to get field state and helpers
 */
export function useField(name: string) {
  const form = useFormContext();
  
  const fieldState = form.getFieldState(name);
  const value = form.watch(name);
  
  return {
    value,
    error: fieldState.error,
    touched: fieldState.isTouched,
    isDirty: fieldState.isDirty,
    isValid: !fieldState.error,
    setValue: (value: any) => form.setValue(name, value),
    setError: (error: string) => form.setError(name, { message: error }),
    clearError: () => form.clearErrors(name),
  };
}

export default FormProvider;