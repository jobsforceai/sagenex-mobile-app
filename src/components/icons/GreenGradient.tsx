import React from 'react'
import Svg, { Circle, Defs, FeBlend, FeFlood, FeGaussianBlur, Filter, G } from 'react-native-svg'

const GreenGradient = () => {
    return (
        <Svg width={402} height={782} viewBox="0 0 402 782" fill="none">
            <G filter="url(#filter0_f_103_168)">
                <Circle cx="201.5" cy="301.5" r="183.5" fill="#00562E" />
            </G>
            <Defs>
                <Filter id="filter0_f_103_168" x="-278.7" y="-178.7" width="960.4" height="960.4" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <FeFlood flood-opacity="0" result="BackgroundImageFix" />
                    <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <FeGaussianBlur stdDeviation="148.35" result="effect1_foregroundBlur_103_168" />
                </Filter>
            </Defs>
        </Svg>
    )
}

export default GreenGradient

