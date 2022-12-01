import { IFormField } from '@thinknimble/tn-forms'
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

/**
 * Given an unknown array type. Narrow it down to a tuple of `[[IFormField<Ti>,Ti],[IFormField<Ti+1>,Ti+1],...]` If the type does not match this pattern then it returns never
 */
export type ConvertToFieldTuple<
  T extends readonly unknown[],
  TResult extends readonly unknown[] = [],
> = T extends readonly [infer FirstTuple, ...infer Rest]
  ? FirstTuple extends readonly [IFormField<infer TValue>, infer TValueCompare]
    ? FirstTuple extends readonly [IFormField<TValue>, TValue]
      ? ConvertToFieldTuple<
          Rest,
          readonly [...TResult, readonly [IFormField<TValue>, TValueCompare]]
        >
      : never
    : never
  : TResult['length'] extends 0
  ? never
  : TResult

type FormState<T> = {
  form: T
  /**
   * Changes the current value of the field, validates it and refreshes the form reference
   * @returns whether the changed field is valid after the change
   */
  createFormFieldChangeHandler: <T>(field: IFormField<T>) => (value: T) => boolean
  /**
   * Cast your array of field-value tuples as `const` and pass the typeof that object to this method to get a fully type-safe call.
   * We make sure you call this method with the right set of tuples of `[IFormField<T>,T]`
   * @example 
   const tupleFields = [
        [form.address, ''],
        [form.state, 0],
      ] as const
      setFields<typeof tupleFields>(tupleFields)
   */
  setFields: <TFieldTuples extends readonly unknown[]>(
    fieldValueTuple: ConvertToFieldTuple<TFieldTuples>,
  ) => void
  overrideForm: (form: T) => void
  /**
   * Validates the whole form and refreshes the form reference. Especially useful when validation across multiple fields is required (such as MustMatchValidator)
   */
  validate: () => void
}

const defaultValue = {
  form: null,
  createFormFieldChangeHandler: () => () => false,
  currentStep: 0,
  setCurrentStep: () => undefined,
  overrideForm: () => undefined,
  setFields: () => undefined,
}

const FormContext = createContext<unknown>(defaultValue)

export const useTnForm = <TForm,>() => {
  const unknownCtx: unknown = useContext(FormContext)
  if (!unknownCtx) throw new Error('Hook must be used within a FormProvider')
  return unknownCtx as FormState<TForm>
}

//? This is requiring both a type parameter and a formClass prop, which both technically are the same type (the form class in question). However some errors appear when I try to match those two
export const FormProvider = <TForm extends { replicate: () => TForm; validate: () => void }>({
  children,
  formClass,
}: {
  children: ReactNode
  formClass: { create: () => unknown }
}) => {
  const [form, setForm] = useState(formClass.create() as TForm)
  const createFormFieldChangeHandler = useCallback(
    <T,>(field: IFormField<T>) =>
      (value: T) => {
        field.value = value
        field.validate()
        field.isTouched = true
        const newForm = form.replicate()
        setForm(newForm)
        return field.isValid
      },
    [form],
  )
  const overrideForm = useCallback((newForm: TForm) => {
    setForm(newForm)
  }, [])
  const setFields = useCallback(
    <TFieldTuples extends readonly unknown[]>(
      fieldValueTuples: ConvertToFieldTuple<TFieldTuples>,
    ) => {
      if (Array.isArray(fieldValueTuples))
        (fieldValueTuples as readonly [field: IFormField, value: unknown][]).forEach(
          ([field, value]) => {
            field.value = value
            field.validate()
            field.isTouched = true
          },
        )
      const newForm = form.replicate()
      setForm(newForm)
    },
    [form],
  )
  const validate = useCallback(() => {
    form.validate()
    setForm(form.replicate())
  }, [form])

  const value: FormState<TForm> = useMemo(() => {
    return {
      form,
      createFormFieldChangeHandler,
      overrideForm,
      setFields,
      validate,
    }
  }, [createFormFieldChangeHandler, form, overrideForm, setFields, validate])

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>
}
