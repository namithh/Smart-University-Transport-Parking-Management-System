import React, { useState, useEffect } from 'react'
import { IoClose, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5"
import { MdOutlineEmail, MdOutlineLock, MdOutlinePerson } from "react-icons/md"
import SummaryApi from '../common'
import { toast } from 'react-toastify'

const Profile = ({ user, onClose, callFunc }) => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Pre-populate form
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: ""
      })
    }
  }, [user])

  const displayName = formData.name || ""
  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  // Handle input change (restrict name here)
  const handleOnChange = (e) => {
    const { name, value } = e.target

    if (name === "name") {
      const onlyText = value.replace(/[^A-Za-z\s]/g, "")
      setFormData(prev => ({
        ...prev,
        name: onlyText
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const updateUser = async () => {
    const nameRegex = /^[A-Za-z\s]+$/  // only letters + spaces

    if (!formData.name.trim()) {
      toast.error("Name cannot be empty")
      return
    }

    if (!nameRegex.test(formData.name)) {
      toast.error("Name must contain only letters")
      return
    }

    if (!formData.email.trim()) {
      toast.error("Email cannot be empty")
      return
    }

    setLoading(true)

    try {
      const fetchResponse = await fetch(SummaryApi.updateUserdetails.url, {
        method: SummaryApi.updateUserdetails.method,
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user._id,
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined
        })
      })

      const responseData = await fetchResponse.json()

      if (responseData.success) {
        toast.success(responseData.message)
        onClose()
        callFunc()
      } else {
        toast.error(responseData.message)
      }

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-gray-100 p-7">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Edit Profile
              </h2>
              <p className="text-xs text-gray-400">
                Update your account details
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5"
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Full Name</label>
            <div className="relative">
              <MdOutlinePerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleOnChange}
                placeholder="Enter your name"
                className="w-full pl-9 pr-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Email</label>
            <div className="relative">
              <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleOnChange}
                placeholder="Enter your email"
                className="w-full pl-9 pr-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              New Password
            </label>
            <div className="relative">
              <MdOutlineLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleOnChange}
                placeholder="Leave blank to keep current"
                className="w-full pl-9 pr-10 py-2 border rounded-lg"
              />

              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">

          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={updateUser}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg"
          >
            {loading ? "Saving..." : "Save"}
          </button>

        </div>

      </div>
    </div>
  )
}

export default Profile