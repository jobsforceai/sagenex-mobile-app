import React from 'react'
import { View } from 'react-native'

type IconProps = {
  Icon: React.FC<{ color: string; width?: number; height?: number }>
  focused: boolean
  size?: number
  activeColor?: string
  inactiveColor?: string
}

export default function TabBarIcon({ Icon, focused, size = 24, activeColor = '#41DA93', inactiveColor = '#c3c3c3' }: IconProps) {
  const color = focused ? activeColor : inactiveColor

  return (
    // Use full available height so the icon centers vertically inside the tab item
    <View style={{ minWidth: size, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Icon color={color} width={size} height={size} />
    </View>
  )
}
