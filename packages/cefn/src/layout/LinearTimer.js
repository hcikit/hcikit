import styled, { keyframes } from 'styled-components'
import React from 'react'

let times = []

const createAnimation = time => {
  let widthAnimation = keyframes`
    from {
      width: 0%;
    }
    to {
      width: 100%;
    }
  `
  let AnimatedInner = styled(Inner)`
    animation: ${widthAnimation} ${time / 1000}s linear;
  `
  return (
    <Outer>
      <AnimatedInner />
    </Outer>
  )
}

const getAnimation = time => {
  if (!times[time]) {
    times[time] = createAnimation(time)
  }

  return times[time]
}

const Outer = styled.div`
  background-color: rgb(240, 132, 171);
  width: 100%;
  overflow: hidden;
  height: 5px;
`
const Inner = styled.div`
  background-color: rgb(225, 0, 80);
  height: 100%;
`
export const LinearTimer = ({ length }) => getAnimation(length)
