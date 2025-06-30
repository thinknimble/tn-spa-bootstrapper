import React, { useState } from 'react'
import { Modal, View, Text, Pressable } from 'react-native'
import { Calendar, DateData } from 'react-native-calendars'
import { format } from 'date-fns'
import { parseDateLocal } from '../utils/help'

type Props = {
  visible: boolean
  date: Date
  onClose: () => void
  onConfirm: (date: Date) => void
  minimumDate?: Date
  maximumDate?: Date
  title?: string
}

export const DatePickerModal: React.FC<Props> = ({
  visible,
  date,
  onClose,
  onConfirm,
  minimumDate,
  maximumDate,
  title = 'Select a date',
}) => {
  const [tempDate, setTempDate] = useState<Date>(date)

  const formattedMinDate = minimumDate ? format(minimumDate, 'yyyy-MM-dd') : undefined
  const formattedMaxDate = maximumDate ? format(maximumDate, 'yyyy-MM-dd') : undefined
  const selected = format(tempDate, 'yyyy-MM-dd')

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-white/40">
        <View className="bg-white rounded-xl p-4 w-[90%] max-w-[400px] shadow-lg shadow-black/20 border border-gray-100">
          <Text className="text-lg text-black font-semibold mb-4 text-center">{title}</Text>
          {% raw %}
          <Calendar
            onDayPress={(day: DateData) => {
              setTempDate(parseDateLocal(day.dateString))
            }}
            markedDates={{
              [selected]: {
                selected: true,
                selectedColor: "#F68F58",
              },
            }}
            minDate={formattedMinDate}
            maxDate={formattedMaxDate}
            theme={{
              todayTextColor: "#F68F58",
              selectedDayTextColor: '#ffffff',
              selectedDayBackgroundColor: "#F68F58",
              arrowColor: '#2563EB',
              monthTextColor: '#111827',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 18,
            }}
            />
            {% endraw %}
          <View className="flex-row justify-end mt-4 gap-4">
            <Pressable onPress={onClose}>
              <Text className="text-alert font-medium">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onConfirm(tempDate)
              }}
            >
              <Text className="text-primary font-bold">Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
