import Form, { IFormField, IValidator, Validator } from '@thinknimble/tn-forms'
import { IFormLevelValidator } from '@thinknimble/tn-forms/lib/cjs/types/interfaces'
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

type BaseFormInputs = Record<string, IFormField>
type FormLevelValidators = Record<string, IFormLevelValidator>

const addFormLevelValidatorsMutate = <
  TInputs extends BaseFormInputs,
  TForm extends Form<TInputs> = Form<TInputs>,
>(
  form: TForm,
  validators: FormLevelValidators,
) => {
  Object.entries(validators).forEach(([fieldName, validator]) => {
    form.addFormLevelValidator(fieldName, validator)
  })
}

export const FormProvider = <TFormInputs extends BaseFormInputs>({
  children,
  formClass,
  formLevelValidators = {},
}: {
  children: ReactNode
  formClass: { create(): Form<TFormInputs> }
  /**
   * Reference which validators you want to persist through form replication
   */
  formLevelValidators?: FormLevelValidators
}) => {
  const [form, setForm] = useState(formClass.create())

  const customReplicate = useCallback(() => {
    const newForm = form.replicate()
    addFormLevelValidatorsMutate<TFormInputs>(newForm, formLevelValidators)
    return newForm
  }, [form, formLevelValidators])

  const createFormFieldChangeHandler = useCallback(
    <T,>(field: IFormField<T>) =>
      (value: T) => {
        field.value = value
        field.validate()
        field.isTouched = true
        const newForm = customReplicate()
        setForm(newForm)
        return field.isValid
      },
    [customReplicate],
  )

  const overrideForm = useCallback((newForm: Form<TFormInputs>) => {
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
      const newForm = customReplicate()
      setForm(newForm)
    },
    [customReplicate],
  )

  const validate = useCallback(() => {
    form.validate()
    const newForm = customReplicate()
    setForm(newForm)
  }, [customReplicate, form])

  const value: FormState<Form<TFormInputs>> = useMemo(() => {
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
