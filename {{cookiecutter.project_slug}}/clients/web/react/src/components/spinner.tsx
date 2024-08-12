import { CSSProperties, FC } from 'react'
import { colors } from 'tailwind.colors'

export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
const BASE_SIZE = 12
const BASE_BORDER = 2
const PRIMARY_COLOR = colors.primary[500]
const mapWidthHeightBySize: Record<
  SizeVariant,
  { width: number; height: number; border: string; borderTop: string }
> = {
  xs: {
    height: BASE_SIZE,
    width: BASE_SIZE,
    border: `${BASE_BORDER}px solid #f3f3f3`,
    borderTop: `${BASE_BORDER}px solid ${PRIMARY_COLOR}`,
  },
  sm: {
    height: BASE_SIZE * 2,
    width: BASE_SIZE * 2,
    border: `${BASE_BORDER * 2}px solid #f3f3f3`,
    borderTop: `${BASE_BORDER * 2}px solid ${PRIMARY_COLOR}`,
  },
  md: {
    height: BASE_SIZE * 3,
    width: BASE_SIZE * 3,
    border: `${BASE_BORDER * 3}px solid #f3f3f3`,
    borderTop: `${BASE_BORDER * 3}px solid ${PRIMARY_COLOR}`,
  },
  lg: {
    height: BASE_SIZE * 4,
    width: BASE_SIZE * 4,
    border: `${BASE_BORDER * 4}px solid #f3f3f3`,
    borderTop: `${BASE_BORDER * 4}px solid ${PRIMARY_COLOR}`,
  },
  xl: {
    height: BASE_SIZE * 5,
    width: BASE_SIZE * 5,
    border: `${BASE_BORDER * 5}px solid #f3f3f3`,
    borderTop: `${BASE_BORDER * 5}px solid ${PRIMARY_COLOR}`,
  },
}

/**
 * @author https://www.notimedad.dev/easy-react-spinner-component/
 */
export const Spinner: FC<{
  customStyles?: CSSProperties
  size: SizeVariant
}> = ({ customStyles = {}, size }) => {
  const defaultStyles = {
    border: '10px solid #f3f3f3',
    borderTop: '10px solid #3498db',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    animation: 'spin 1s ease-in-out infinite',
  }

  return (
    <div
      className="animate-spin"
      style={{
        ...defaultStyles,
        ...customStyles,
        ...mapWidthHeightBySize[size],
      }}
    ></div>
  )
}
