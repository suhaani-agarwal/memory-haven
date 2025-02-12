// "use client";
// import React from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { FaUsers, FaBookOpen, FaClipboardList, FaHeartbeat } from "react-icons/fa";
// import { signOut } from "next-auth/react";
// import { Button } from "@/components/ui/button";


// const Page = () => {
//   return (
//     <div className="flex min-h-screen">
//       {/* Sidebar */}
//       <div className="w-64 bg-[#E6E6FA] text-gray-800 p-5 shadow-lg">
//         <h2 className="text-2xl font-bold text-gray-800">Memory Haven</h2>
//         <ul className="mt-8 space-y-4 text-lg">
//           <li className="p-4 bg-[#D8BFD8] hover:bg-[#C5A3C5] rounded-lg flex items-center gap-3">
//             <FaUsers size={24} />
//             <Link href="/dashboard">My Family</Link>
//           </li>
//           <li className="p-4 bg-[#D8BFD8] hover:bg-[#C5A3C5] rounded-lg flex items-center gap-3">
//             <FaBookOpen size={24} />
//             <Link href="/dashboard/memoryLane">Memory Journal</Link>
//           </li>
//           <li className="p-4 bg-[#D8BFD8] hover:bg-[#C5A3C5] rounded-lg flex items-center gap-3">
//             <FaClipboardList size={24} />
//             <Link href="/dashboard/reminders">Activity & Reminders</Link>
//           </li>
//           <li className="p-4 bg-[#D8BFD8] hover:bg-[#C5A3C5] rounded-lg flex items-center gap-3">
//             <FaHeartbeat size={24} />
//             <Link href="/dashboard/health">Health & Hydration</Link>
//           </li>
//         </ul>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 bg-[#FBEAFF] p-5">
//         <h1 className="text-4xl font-bold text-[#9463F7]">Welcome to Memory Haven! </h1>
//         <p className="mt-4 text-xl text-gray-700">
//           A place to cherish your memories and maintain a healthy routine.
//         </p>
//         <Button 
//             variant="destructive" 
//             onClick={() => signOut()}
//             className="bg-blue-600 hover:bg-blue-700"
//           >
//             Logout
//           </Button>

//         {/* Cards Section */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
//           {[
//             {
//               title: "My Family",
//               description: "Stay connected with loved ones.",
//               link: "/activities",
//               image: "https://media.istockphoto.com/id/505229559/photo/memory-lane-in-sepia.jpg?s=612x612&w=0&k=20&c=UDJqmbJbV4hNgXQOAdJs0wCRcmgtwTFJzupR4KMMrPM="
//             },
//             {
//               title: "Memory Journal",
//               description: "Record precious memories easily.",
//               link: "/visualguide",
//               image: "https://images.squarespace-cdn.com/content/v1/55d35604e4b08af97dadd334/1293a7f0-f1f0-4f46-9736-efd2806e555a/i-remember-journal-for-memory-keeping.jpg"
//             },
//             {
//               title: "Activity & Reminders",
//               description: "Plan your daily activities effortlessly.",
//               link: "/memoryLane",
//               image: "https://www.shutterstock.com/image-vector/brain-training-rock-muscles-barbell-600nw-757605628.jpg"
//             },
//             {
//               title: "Health & Hydration",
//               description: "Track your wellness with ease.",
//               link: "/reminders",
//               image: "https://media.istockphoto.com/id/1309339353/vector/old-man-and-medicine-illustration.jpg?s=612x612&w=0&k=20&c=wt5CK1OFxXQ9UiIkW0FZ5NcyJnRWA9S2fLmeHZ3sVT4="
              
//             }
//           ].map((card, index) => (
//             <div
//               key={index}
//               className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
//             >
//               <h2 className="text-2xl font-bold text-gray-800">{card.title}</h2>
//               <p className="text-gray-600 text-lg mt-2">{card.description}</p>

//               {/* Updated Image Container */}
//               <div className="relative w-full h-64 mt-4 rounded-xl overflow-hidden">
//                 <Image
//                   src={card.image}
//                   alt={card.title}
//                   width={500}
//                   height={256}  
//                   className="w-full h-full object-cover rounded-xl"
//                   priority
//                 />
//               </div>

//               <div className="mt-6 text-center">
//                 <Link
//                   href={card.link}
//                   className="text-xl bg-[#C3A2F7] text-white px-6 py-3 rounded-lg hover:bg-[#D3BFF9]"
//                 >
//                   Explore →
//                 </Link>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Page;


"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUsers, FaBookOpen, FaClipboardList, FaHeartbeat, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Dialog,DialogTrigger,DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { CgProfile } from "react-icons/cg";
import { Settings, notificationSettings } from "lucide-react";
import { FaUserCircle } from "react-icons/fa";
import { FaPhone } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


const Page = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>; // Prevents accessing undefined session
  }

  const UserProfileDialog = () => {
    const { data: session } = useSession();
  
    const emergencyContact = {
      name: "Mary Smith",
      relation: "Daughter",
      phone: "+1 (555) 123-4567"
    };
  
    const homeAddress = "123 Safe Street, Peaceful Town";
  
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="p-2 hover:bg-blue-50 rounded-full">
            <CgProfile className="w-10 h-10 text-blue-600" />
          </Button>
        </DialogTrigger>
  
        <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
          {/* Accessible Title */}
          <DialogTitle>
            <VisuallyHidden>Profile Details</VisuallyHidden>
          </DialogTitle>
  
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
            </div>
  
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <FaUserCircle className="w-16 h-16 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {session?.user?.name || "User"}
                </h2>
                <p className="text-gray-600 text-lg">
                  {session?.user?.email}
                </p>
              </div>
            </div>
  
            {/* Emergency Contact */}
            <div className="p-4 bg-pink-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaPhone className="text-pink-600" />
                <h3 className="text-lg font-semibold text-gray-800">Emergency Contact</h3>
              </div>
              <div className="ml-7 space-y-1 text-gray-700">
                <p>{emergencyContact.name} ({emergencyContact.relation})</p>
                <p className="text-lg">{emergencyContact.phone}</p>
              </div>
            </div>
  
            {/* Home Location */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaMapMarkerAlt className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Home Address</h3>
              </div>
              <p className="ml-7 text-gray-700">{homeAddress}</p>
            </div>
  
            {/* Sign Out Button */}
            <Button 
              onClick={() => signOut()}
              variant="destructive"
              className="w-full flex items-center justify-center gap-2 py-3 text-lg"
            >
              <FaSignOutAlt />
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Using softer colors and larger text */}
      <div className="w-72 bg-slate-50 text-slate-800 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <FaHeartbeat className="text-blue-600 text-3xl" />
          <h2 className="text-2xl font-semibold text-slate-800">Care Compass</h2>
        </div>

        <ul className="space-y-3 text-lg">
          <li className="rounded-lg overflow-hidden">
            <Link href="/dashboard" className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
              <FaUsers size={24} className="text-blue-600" />
              <span className="font-medium">Family Circle</span>
            </Link>
          </li>
          <li className="rounded-lg overflow-hidden">
            <Link href="/dashboard/memoryLane" className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
              <FaBookOpen size={24} className="text-blue-600" />
              <span className="font-medium">Daily Journal</span>
            </Link>
          </li>
          <li className="rounded-lg overflow-hidden">
            <Link href="/dashboard/reminders" className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
              <FaClipboardList size={24} className="text-blue-600" />
              <span className="font-medium">Daily Schedule</span>
            </Link>
          </li>
          <li className="rounded-lg overflow-hidden">
            <Link href="/dashboard/health" className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
              <FaHeartbeat size={24} className="text-blue-600" />
              <span className="font-medium">Health Track</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Top Bar with Location and Profile */}
        <div className="bg-white shadow-md p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Location Tracking Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                <FaMapMarkerAlt className="text-xl" />
                <span className="font-medium">Safe Zone Active</span>
              </div>
              <Link href="/locationfinal" className="text-blue-600 hover:text-blue-700 font-medium">
                View Location Details →
              </Link>
            </div>

            {/* Profile and Logout */}
            <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => signOut()} className="border-red-200 text-red-600 hover:bg-red-50">
              Sign Out
            </Button>
            <UserProfileDialog />
          </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-semibold text-slate-800 mb-6">Welcome to Your Care Dashboard {session.user?.email}!</h1>

          {/* Featured Section - Location Safety */}
          <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-slate-800 mb-3">Location Safety Active</h2>
                <p className="text-slate-600 text-lg mb-4">
                  Your safety zone is set to 100 meters around your home. Family will be notified if you go beyond this area.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Check Location Settings
                </Button>
              </div>
              <div className="hidden md:block w-1/3">
                <Image
                  src="/map-placeholder.jpg"
                  alt="Location Map"
                  width={300}
                  height={200}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </Card>

          {/* Main Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Family Circle",
                description: "Stay connected with your loved ones and caregivers.",
                icon: <FaUsers className="text-4xl text-blue-600" />,
                link: "/family"
              },
              {
                title: "Daily Journal",
                description: "Record your daily activities and memories.",
                icon: <FaBookOpen className="text-4xl text-blue-600" />,
                link: "/visualguide"
              },
              {
                title: "Daily Schedule",
                description: "Keep track of your medications and appointments.",
                icon: <FaClipboardList className="text-4xl text-blue-600" />,
                link: "/schedule"
              },
              {
                title: "Health Track",
                description: "Monitor your health and medication schedule.",
                icon: <FaHeartbeat className="text-4xl text-blue-600" />,
                link: "/health"
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 mb-4">{feature.description}</p>
                    <Link
                      href={feature.link}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Open {feature.title} →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;