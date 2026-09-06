'use client';

import { STEPS } from './types';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number; // 0-indexed
  completedSteps: number[];
}

export default function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="w-full py-8">
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-start justify-between relative">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = index === currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10 flex-1">
              {/* Circle + Connector */}
              <div className="flex items-center w-full justify-center">
                {/* Left line */}
                {index > 0 && (
                  <div className={`h-[2px] flex-1 ${
                    completedSteps.includes(index - 1) || (isActive && completedSteps.includes(index - 1))
                      ? 'bg-primary'
                      : 'bg-gray-200'
                  }`} />
                )}

                {/* Circle */}
                <div
                  className={`w-[38px] h-[38px] rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-primary text-white'
                      : isActive
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : step.number}
                </div>

                {/* Right line */}
                {index < STEPS.length - 1 && (
                  <div className={`h-[2px] flex-1 ${
                    isCompleted ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>

              {/* Labels */}
              <div className="mt-3 text-center">
                <p className={`text-[13px] font-semibold leading-tight ${
                  isActive ? 'text-foreground' : isCompleted ? 'text-primary' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
                <p className={`text-[11px] mt-0.5 leading-tight ${
                  isActive ? 'text-gray-500' : isCompleted ? 'text-primary/60' : 'text-gray-300'
                }`}>
                  {step.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: compact horizontal */}
      <div className="md:hidden flex items-center justify-center gap-2">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = index === currentStep;

          return (
            <div key={step.number} className="flex items-center gap-2">
              <div
                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${
                  isCompleted
                    ? 'bg-primary text-white'
                    : isActive
                      ? 'bg-primary text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? <Check size={13} strokeWidth={3} /> : step.number}
              </div>
              {isActive && (
                <span className="text-[12px] font-semibold text-foreground">{step.label}</span>
              )}
              {index < STEPS.length - 1 && (
                <div className={`w-4 h-[2px] ${isCompleted ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
