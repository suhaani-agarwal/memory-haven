
"use client"
import Image from "next/image";
import Link from "next/link";

import React from 'react';
import { useState } from 'react';
import { Heart, Brain, Bell, Users, ChevronRight, Star, Play } from 'lucide-react';


const features = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Memory Journal",
    description: "Preserve precious moments with our intuitive memory collection tools."
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "AI Assistance",
    description: "Gentle support that adapts to individual needs and preferences."
  },
  {
    icon: <Bell className="w-8 h-8" />,
    title: "Smart Reminders",
    description: "Stay on track with kind, timely notifications for daily activities."
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Family Connect",
    description: "Share moments and updates with loved ones effortlessly."
  }
];

// Testimonial data
const testimonials = [
  {
    quote: "Memory Haven has brought our family closer together. Mom loves seeing daily photos from the grandkids.",
    author: "Sarah M.",
    role: "Daughter & Caregiver"
  },
  {
    quote: "The memory journal feature has been incredible. We've discovered so many precious memories.",
    author: "James T.",
    role: "Family Member"
  }
];

export default function Home() {

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Making Every Memory
                <span className="text-blue-600 block">Matter</span>
              </h1>
              <p className="text-xl text-gray-600">
                Your compassionate companion for preserving memories and maintaining independence, 
                designed with love for families touched by dementia.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href='/signup'><button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105">
                  Sign Up!
                </button></Link>
                <button className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <img
                  src="https://thumbs.dreamstime.com/b/multi-generations-indian-family-portrait-home-asian-people-living-lifestyle-41652913.jpg"
                  alt="Elderly person with family"
                  className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold">4.9/5</span>
                    <span className="text-gray-600">(2,000+ reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-700 text-center mb-16">How We Support You</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-blue-600"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl text-gray-700 font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      {/* <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-700 text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className="bg-white p-8 rounded-xl shadow-lg text-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-12 h-12 bg-blue-600  text-white rounded-full flex items-center justify-center font-bold text-xl mb-6">
                  {step}
                </div>
                <img
                  src={`/api/placeholder/200/200`}
                  alt={`Step ${step}`}
                  className="w-32 h-32 mx-auto mb-6 rounded-lg"
                />
                <h3 className="text-xl font-bold mb-4">
                  {step === 1 ? "Download & Setup" : step === 2 ? "Personalize" : "Connect"}
                </h3>
                <p className="text-gray-600">
                  {step === 1
                    ? "Get started in minutes with our guided setup process"
                    : step === 2
                    ? "Customize the app to match your daily routine"
                    : "Invite family members to join your care circle"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      

      {/* How It Works Timeline */}
      {/* How It Works Timeline */}
<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
      Your Journey Begins Here
    </h2>
    <div className="relative">
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200" />
      <div className="space-y-12">
        {[
          {
            step: "Step 1",
            title: "Download & Setup",
            description: "Get started in just 2 minutes",
            image: "/images/step1.png"
          },
          {
            step: "Step 2",
            title: "Personalize Your Experience",
            description: "Set reminders, add photos, and more",
            image: "/images/step2.png"
          },
          {
            step: "Step 3",
            title: "Connect with Loved Ones",
            description: "Your family members get notified and can send love back",
            image: "/images/step3.png"
          }
        ].map((item, index) => (
          <div key={index} className="relative">
            <div
              className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
            >
              <div className="w-1/2 flex justify-center">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-80 h-auto rounded-lg shadow-lg"
                />
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full" />
              <div className="w-1/2 p-6">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-blue-600 font-bold mb-2">{item.step}</div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>


      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-8">Start Your Memory Haven Journey</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto">
            Join thousands of families who've found support, connection, and peace of mind.
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105">
            Download Now
          </button>
        </div>
      </section>
    </div>

  );
}
