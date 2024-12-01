import React from 'react';
import classNames from 'classnames';
import css from './SectionTestimonials.module.css';

const SectionTestimonials = (props) => {
  const { rootClassName, className } = props;

  const testimonials = [
    { text: 'This platform is amazing! It helped me achieve my fitness goals in no time.', name: 'X' },
    { text: 'I love how interactive the classes are. The instructors are very supportive.', name: 'Y' },
    { text: 'A wonderful experience! I highly recommend Vivacity to everyone.', name: 'Z' },
    { text: 'The live feedback from instructors is fantastic. I’ve seen great results.', name: 'A' },
    { text: 'The community aspect is incredible. I feel so motivated every time.', name: 'B' },
    { text: 'Great experience! I’m excited to join more classes.', name: 'C' },
    { text: 'This platform has completely transformed my fitness routine.', name: 'D' },
    { text: 'Such a convenient way to work out from home with expert guidance.', name: 'E' },
  ];

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <div className={css.title}>
        <p>What Do Vivacity Students Say?</p>
      </div>
      <div className={css.content}>
        <p>We value feedback from our students. Here's what they shared with us:</p>
      </div>

      <div className={css.steps}>
        {testimonials.map((testimonial, index) => (
          <div key={index} className={css.step}>
            <div className={css.stars}>★★★★★</div>
            <p className={css.testimonialText}>"{testimonial.text}"</p>
            <p className={css.testimonialName}>{testimonial.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionTestimonials;
