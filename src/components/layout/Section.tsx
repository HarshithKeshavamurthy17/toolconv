import * as React from 'react';
import { cn } from '../../lib/cn';

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  id?: string;
};

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ id, className, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn('container mx-auto w-full max-w-[1920px] px-6 md:px-8 lg:px-12 xl:px-16 py-16 sm:py-20', className)}
        {...props}
      >
        {children}
      </section>
    );
  },
);

Section.displayName = 'Section';

