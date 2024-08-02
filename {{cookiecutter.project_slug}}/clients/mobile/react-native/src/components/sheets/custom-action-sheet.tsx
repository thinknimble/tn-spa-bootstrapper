import React, { FC } from 'react'
import ActionSheet, { ActionSheetProps, ActionSheetRef } from 'react-native-actions-sheet'

export interface CustomActionSheetProps extends ActionSheetProps {
  children: React.ReactNode
  actionSheetRef: React.Ref<ActionSheetRef> | undefined
  sheetId: string
}

export const CustomActionSheet: FC<ExtendedActionSheetProps> = ({
  children,
  sheetId,
  actionSheetRef,
  snapPoints = [100],
  ...rest
}) => {
  return (
    <ActionSheet
      id={sheetId}
      ref={actionSheetRef}
      containerClassName={rest.containerClassName ?? 'rounded-t-l-xl rounded-t-r-xl bg-white mt-4'}
      indicatorClassName={rest.indicatorClassName ?? 'w-[100px] bg-black'}
      snapPoints={snapPoints}
      initialSnapIndex={0}
      useBottomSafeAreaPadding
      gestureEnabled={true}
      defaultOverlayOpacity={0.3}
      backgroundInteractionEnabled={false}
      {...rest}
    >
      {children}
    </ActionSheet>
  )
}