import { FC, InputHTMLAttributes, useState } from 'react'
import { Input } from './input'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export const PasswordInput: FC<
  InputHTMLAttributes<HTMLInputElement> & {
    iconTabIndex?: number
    label?: string
  }
> = ({ iconTabIndex, ...props }) => {
  const [showPassword, setShowPassword] = useState(false)
  const onTogglePassword = () => {
    setShowPassword((p) => !p)
  }

  return (
    <Input
      placeholder={props.placeholder}
      type={showPassword ? 'text' : 'password'}
      onChange={props.onChange}
      className="w-full"
      icon={
        <button onClick={onTogglePassword} type="button" tabIndex={iconTabIndex}>
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      }
      {...props}
    />
  )
}
