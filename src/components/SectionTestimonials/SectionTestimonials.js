import React from 'react';
import classNames from 'classnames';
import css from './SectionTestimonials.module.css';

const SectionTestimonials = (props) => {
  const { rootClassName, className } = props;

  const testimonials = [
    { text: 'The split class is my favorite! The best thing is that everyone can progress from where they stand right now! I feel an inch longer after these sessions!', name: 'Mina' },
    { text: 'The flex-mobility class is truly exceptional. Often, we underestimate the significance of flexibility, but Arta brings a keen focus to every detail. The exercises are both challenging and enjoyable, making this class a delightful journey towards improved flexibility.', name: 'S.K' },
    { text: 'She is amazing! I really love how she holds the entire class professionally and treats every single participant with their level of flexibility.', name: 'Saeedeh' },
    { text: 'Best ever trainer!! She not only describes everything perfectly, but also observes you individually, making sure even the slightest contraction of your muscles are in the right places ;)', name: 'Negar' },
  ];

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
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
