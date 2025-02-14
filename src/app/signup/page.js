// "use client"
// import React, { useState, useRef, useEffect } from 'react';
// import { ChevronRight} from 'lucide-react';
// // import { FaGoogle } from "react-icons/fa";
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';


// const Signup = () => {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     level: '',
//     goals: [],
//     learningStyle: '',
//     experience: '',
//     timeCommitment: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
  
//   const [apiError, setApiError] = useState('');


//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.username.trim()) {
//       newErrors.username = 'Username is required';
//     } else if (formData.username.length > 100) {
//       newErrors.username = 'Username must be less than 100 characters';
//     }

//     if (!formData.email) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Invalid email format';
//     }

//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 8) {
//       newErrors.password = 'Password must be at least 8 characters';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setApiError('');

// //     if (!validateForm()) {
// //       return;
// //     }


// //     setIsLoading(true);

// //     try {
// //       const response = await fetch('/api/check-user', {  // Create this API route
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ email: formData.email, username: formData.username }),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         setApiError(data.message || 'Something went wrong');
// //         setIsLoading(false);
// //         return;  // Stop here if user exists
// //       }

// //  // Move only if user does NOT exist
// //     } catch (error) {
// //       setApiError('An error occurred. Try again later.');
// //       setIsLoading(false);
// //     }

// //   };



// //   const handleFinalSubmit = async (e) => {
// //     console.log("accessing handle final submit ")
// //     e.preventDefault();
// //     setIsLoading(true);
// //     try {
// //       const response = await fetch('/api/user', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           username: formData.username,
// //           email: formData.email,
// //           password: formData.password,
// //         }),
// //       });
// //       const data = await response.json();
// //       if (response.ok) {
// //         console.log("User created:", data.user);
// //         await handleGenerateRoadmap(data.user.id); // Pass new userId
        
// //       }
// //       else {
// //         setApiError(data.message || 'Signup failed. Try again.');
// //         // console.log(formData)
// //       }
// //     } catch (error) {
// //       setApiError('An error occurred. Try again later.');
// //       console.log(formData)
// //     }finally{
// //       setIsLoading(false);
// //     }
// //   };

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setApiError('');

//   if (!validateForm()) {
//       return;
//   }

//   setIsLoading(true);

//   try {
//       // Step 1: Check if user exists
//       const checkResponse = await fetch('/api/check-user', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email: formData.email, username: formData.username }),
//       });

//       const checkData = await checkResponse.json();

//       if (!checkResponse.ok) {
//           setApiError(checkData.message || 'User already exists');
//           setIsLoading(false);
//           return;  // Stop execution if user exists
//       }

//       // Step 2: Proceed with signup if user does not exist
//       const signupResponse = await fetch('/api/user', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//               username: formData.username,
//               email: formData.email,
//               password: formData.password,
//           }),
//       });

//       const signupData = await signupResponse.json();

//       if (signupResponse.ok) {
//           console.log("User created:", signupData.user);
//           router.push('/dashboard');
//       } else {
//           setApiError(signupData.message || 'Signup failed. Try again.');
//       }

//   } catch (error) {
//       console.error(error);
//       setApiError('An error occurred. Try again later.');
//   } finally {
//       setIsLoading(false);
//   }
// };



//   const [inputValueUsername, setInputValueUsername] = useState("");
//   const [inputValueEmail, setInputValueEmail] = useState("");
//   const [inputValuePass, setInputValuePass] = useState("");

//   const inputRefUsername = useRef(null);
//   useEffect(() => {
//     if (inputRefUsername.current) {
//       inputRefUsername.current.focus();
//     }
//   }, [inputValueUsername]); // Ensures input remains focused even after state changes


//   const inputRefEmail = useRef(null);
//   useEffect(() => {
//     if (inputRefEmail.current) {
//       inputRefEmail.current.focus();
//     }
//   }, [inputValueEmail]); // Ensures input remains focused even after state changes


//   const inputRefPass = useRef(null);
//   useEffect(() => {
//     if (inputRefPass.current) {
//       inputRefPass.current.focus();
//     }
//   }, [inputValuePass]); // Ensures input remains focused even after state changes


//   const handleInputChangeUsername = (e) => {
//     const { name, value } = e.target;
//     setInputValueUsername(e.target.value);

//     setFormData((prev) => {
//       // Only update if the value is actually changing

//       return { ...prev, [name]: value };
//     });

//     setErrors((prev) => ({
//       ...prev,
//       [name]: '',
//     }));
//   };
//   const handleInputChangeEmail = (e) => {
//     const { name, value } = e.target;
//     setInputValueEmail(e.target.value);

//     setFormData((prev) => {
//       // Only update if the value is actually changing

//       return { ...prev, [name]: value };
//     });

//     setErrors((prev) => ({
//       ...prev,
//       [name]: '',
//     }));
//   };
//   const handleInputChangePass = (e) => {
//     const { name, value } = e.target;
//     setInputValuePass(e.target.value);

//     setFormData((prev) => {
//       // Only update if the value is actually changing

//       return { ...prev, [name]: value };
//     });

//     setErrors((prev) => ({
//       ...prev,
//       [name]: '',
//     }));
//   };


//   const SignupStep = () => (
//     <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-lg">
//       <div className="text-center">
//         <h2 className="text-3xl font-bold text-gray-900">Join MemoryHaven</h2>
//         <p className="mt-2 text-gray-600">Start your MemoryHaven journey today</p>
//       </div>

//       {apiError && (
//         <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
//           {apiError}
//         </div>
//       )}

//       <div className="space-y-4">
//         {/* <button disabled={isLoading} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
//           <FaGoogle className="w-5 h-5 mr-2" />
//           Continue with Google
//         </button> */}

//         {/* <button disabled={isLoading} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
//           <Github className="w-5 h-5 mr-2" />
//           Continue with GitHub
//         </button> */}

//         {/* <div className="relative">
//           <div className="absolute inset-0 flex items-center">
//             <div className="w-full border-t border-gray-300" />
//           </div>
//           <div className="relative flex justify-center text-sm">
//             <span className="px-2 bg-white text-gray-500">Or continue with</span>
//           </div>
//         </div> */}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Username</label>
//             <input
//               type="text"
//               ref={inputRefUsername}
//               name="username"
//               value={formData.username}
//               onChange={handleInputChangeUsername}
//               className={`mt-1 block w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'
//                 } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black`}
//             />
//             {errors.username && (
//               <p className="mt-1 text-sm text-red-500">{errors.username}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <input
//               type="email"
//               name="email"
//               ref={inputRefEmail}
//               value={formData.email}
//               onChange={handleInputChangeEmail}
//               className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'
//                 } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black`}
//             />
//             {errors.email && (
//               <p className="mt-1 text-sm text-red-500">{errors.email}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Password</label>
//             <input
//               type="password"
//               name="password"
//               ref={inputRefPass}
//               value={formData.password}
//               onChange={handleInputChangePass}
//               className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'
//                 } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black`}
//             />
//             {errors.password && (
//               <p className="mt-1 text-sm text-red-500">{errors.password}</p>
//             )}
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isLoading ? 'Moving to next...' : 'Next'}
//             <ChevronRight className="ml-2 w-4 h-4" />
//           </button>
//         </form>
//         <div className="relative flex justify-center text-sm">
//           <span className="px-2 bg-white text-gray-500">Already have an account? </span>
//           <div className='text-blue-700'><Link href="/login"><button>Log In</button></Link></div>
//         </div>
//       </div>
//     </div>
//   );

  

  


//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
//       <SignupStep/>
//     </div>
//   );
// };

// export default Signup;



"use client";
import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length > 100) {
      newErrors.username = "Username must be less than 100 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simulate signup process
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate a delay to mimic backend processing
    setTimeout(() => {
      console.log("Simulating signup for:", formData);
      setIsLoading(false);
      router.push("/dashboard"); // Redirect to dashboard after "signup"
    }, 1000);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Join MemoryHaven</h2>
          <p className="mt-2 text-gray-600">
            Start your MemoryHaven journey today
          </p>
        </div>

        {apiError && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.username ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing up..." : "Sign Up"}
            <ChevronRight className="ml-2 w-4 h-4" />
          </button>
        </form>

        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Already have an account?{" "}
          </span>
          <div className="text-blue-700">
            <Link href="/login">
              <button>Log In</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;