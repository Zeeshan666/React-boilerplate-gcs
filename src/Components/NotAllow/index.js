import { Card } from 'antd'
import React, { useEffect, useState } from 'react'

const Index = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(()=>{
      setLoading(false)
    },1000)
    
  }, [])
  return (
    <Card loading={loading} className="text-center">
      <img className="mt-5" src="/images/error.png" alt="error" width="250" />
      <h2 className="my-4 fw-bold">Sorry, You are not allowed to access this page.</h2>
    </Card>
  )
}

export default Index