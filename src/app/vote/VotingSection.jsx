"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { loadPollId } from "../../components/Settings";

const futures = [
  {
    id: "constraint",
    title: "Constraint",
    description: "AI stalls – scaled and common, but no gains in accuracy, reliability, training, or efficiency.",
    icon: "/images/constraint-logo.svg",
    color: "#C37EB3"
  },
  {
    id: "growth",
    title: "Growth",
    description: "Barriers drop; AI is everywhere, driving mostly positive business and social impact.",
    icon: "/images/growth-logo.svg",
    color: "#2BB856"
  },
  {
    id: "transform",
    title: "Transform",
    description: "Progress in AI for the last 5 years has exceeded expectations in almost every dimension.",
    icon: "/images/transform-logo.svg",
    color: "#198CE6"
  },
  {
    id: "collapse",
    title: "Collapse",
    description: "The number of companies building AI collapse into a handful of mega-players.",
    icon: "/images/collapse-logo.svg",
    color: "#FF4136"
  }
];

const industries = [
  {
    id: "consumer-products",
    name: "Consumer Products",
    icon: "/images/industry/consumer-products.svg"
  },
  {
    id: "industrial-products",
    name: "Industrial Products",
    icon: "/images/industry/industrial-products.svg"
  },
  {
    id: "oil-gas",
    name: "Oil & Gas",
    icon: "/images/industry/oil-gas.svg"
  },
  {
    id: "defense",
    name: "Defense",
    icon: "/images/industry/defense.svg"
  },
  {
    id: "banking-capital-markets",
    name: "Banking & Capital Markets",
    icon: "/images/industry/banking.svg"
  },
  {
    id: "retail",
    name: "Retail",
    icon: "/images/industry/retail.svg"
  },
  {
    id: "life-sciences",
    name: "Life Sciences",
    icon: "/images/industry/life-sciences.svg"
  },
  {
    id: "other",
    name: "Other",
    icon: null
  }
];

export default function VotingSection() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFuture, setSelectedFuture] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (selectedFuture) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Load poll_id from localStorage (set via Settings)
      const pollId = loadPollId();
      
      // Resolve selected future title
      const selectedFutureData = futures.find(f => f.id === selectedFuture);
      const choice = selectedFutureData ? selectedFutureData.title : null;
      
      // Resolve selected industry name
      const selectedIndustryData = industries.find(i => i.id === selectedIndustry);
      const industry = selectedIndustryData ? selectedIndustryData.name : null;
      
      // Insert poll_id, choice and industry
      const voteData = {
        poll_id: pollId,
        choice: choice,
        industry: industry
      };

      const { data, error } = await supabase
        .from('votes')
        .insert([voteData]);

      if (error) {
        console.error('Supabase insert error:', error);
        // 打印更详细的错误信息
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Vote submitted successfully:', data);
      
      // 跳转到结果页面
      const params = new URLSearchParams();
      if (selectedFuture) params.set('future', selectedFuture);
      if (selectedIndustry) params.set('industry', selectedIndustry);
      router.push(`/results?${params.toString()}`);
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleQuit = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-black text-white relative pt-[120px]">
      {/* Background layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero_gradient_new.svg)', opacity: 0.5 }}
      />

      {/* Quit Button */}
      <button
        onClick={handleQuit}
        className="absolute left-16 h-10 px-4 bg-transparent border border-white rounded-none text-white hover:opacity-80 transition-opacity z-10 cursor-pointer"
      >
        Quit
      </button>

      <div className="relative z-10 flex flex-col items-center justify-start px-6 ">
        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          <div className={`h-1 w-16 transition-all duration-300 ${currentStep >= 1 ? 'bg-white' : 'bg-white/20'}`}></div>
          <div className={`h-1 w-16 transition-all duration-300 ${currentStep >= 2 ? 'bg-white' : 'bg-white/20'}`}></div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12 text-center">
          <div className="text-white text-base">
            Question {currentStep}/2
          </div>
        </div>

        {/* Question 1: Select Future */}
        {currentStep === 1 && (
          <>
            {/* Question Title */}
            <h1 
              className="text-4xl md:text-5xl font-bold text-center mb-12"
              style={{
                background: 'linear-gradient(to right, #FFFFFF, #FFE600)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Which future do you think we're heading towards?
            </h1>

            {/* Future Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-7xl w-full">
              {futures.map((future) => (
                <button
                  key={future.id}
                  onClick={() => setSelectedFuture(future.id)}
                  className={`
                    relative p-8 bg-white/5 backdrop-blur-lg outline outline-1 transition-all duration-300 cursor-pointer
                    hover:bg-white/10
                    ${selectedFuture === future.id ? 'outline-white' : 'outline-white/20'}
                  `}
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <img 
                      src={future.icon} 
                      alt={future.title}
                      className="w-20 h-20 object-contain filter brightness-0 invert"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    {future.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-white/70 leading-relaxed text-center">
                    {future.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!selectedFuture}
              className={`
                px-12 py-4 text-base font-normal transition-all duration-300
                ${selectedFuture
                  ? 'bg-white text-black hover:bg-white/90 cursor-pointer'
                  : 'bg-white/30 text-white/30 cursor-not-allowed'
                }
              `}
            >
              Next question
            </button>
          </>
        )}

        {/* Question 2: Select Industry */}
        {currentStep === 2 && (
          <>
            {/* Question Title */}
            <h1 
              className="text-4xl md:text-5xl font-bold text-center mb-12"
              style={{
                background: 'linear-gradient(to right, #FFFFFF, #FFE600)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Which industry are you from?
            </h1>

            {/* Industry Grid */}
            <div className="grid grid-cols-4 gap-px mb-12 max-w-6xl w-full bg-white/20">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(industry.id)}
                  className={`
                    relative p-8 bg-black outline outline-1 transition-all duration-300 cursor-pointer
                    hover:bg-white/5 flex flex-col items-center justify-center min-h-[160px]
                    ${selectedIndustry === industry.id ? 'outline-white' : 'outline-white/20'}
                  `}
                >
                  {/* Icon */}
                  {industry.id !== 'other' && (
                    <div className="flex justify-center mb-5">
                      <img 
                        src={industry.icon} 
                        alt={industry.name}
                        className="w-8 h-8 object-contain filter brightness-0 invert"
                      />
                    </div>
                  )}

                  {/* Name */}
                  <p className="text-white text-center text-sm font-normal">
                    {industry.name}
                  </p>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-12 py-4 text-base font-normal bg-white/5 outline outline-1 outline-white/20 text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`
                  px-12 py-4 text-base font-normal transition-all duration-300
                  ${isSubmitting
                    ? 'bg-white/30 text-white/30 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-white/90 cursor-pointer'
                  }
                `}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
