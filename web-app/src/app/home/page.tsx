import SigninButton from '@/components/signInButton'
import React from 'react'

function Home() {
  return (
    <div className='ml-[16vw] border-2 h-screen flex justify-evenly items-center '>
      <div className='border-2 h-20 w-56 flex justify-evenly items-center flex-col '>
        <h3>Home</h3>
        <SigninButton />
      </div>

    </div>

  )
}

export default Home