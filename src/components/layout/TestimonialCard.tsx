
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import Image from "next/image";

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const fallbackInitial = testimonial.name ? testimonial.name.charAt(0) : '?';
  
  return (
    <Card className="h-full flex flex-col justify-between shadow-lg">
      <CardContent className="p-6">
        <div className="flex text-amber-500 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
        </div>
        <blockquote className="text-muted-foreground italic border-l-4 border-primary/20 pl-4">
          "{testimonial.quote}"
        </blockquote>
      </CardContent>
      <div className="bg-card p-6 pt-0 flex items-center gap-4 mt-auto">
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={testimonial.avatar} 
            alt={testimonial.name} 
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <AvatarFallback>{fallbackInitial}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-primary">{testimonial.name}</p>
          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </Card>
  );
}
