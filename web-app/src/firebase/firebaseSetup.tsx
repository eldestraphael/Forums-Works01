'use client'

import React, { useEffect } from 'react'
import { useFirebase } from '@/firebase/firebaseConfig'

function FirebaseSetup() {
    const { analytics } = useFirebase()
    useEffect(() => {
        analytics
    }, [analytics])

    return <></>
}

export default FirebaseSetup
