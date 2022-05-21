import React, { useState, useEffect, useRef } from 'react';
import { bool, string } from 'prop-types';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import image from './no-profile-pic.png';
import css from './SectionTrainers.module.css';
import { BsArrowLeftCircle, BsArrowRightCircle } from 'react-icons/bs';

const SectionTrainers = props => {
  const { rootClassName, className, trainers, trainersLoading, trainersError } = props;
  const classes = classNames(rootClassName || css.root, className);
  const [scroll, setScroll] = useState(null);
  const [scrollRight, setScrollRight] = useState();
  const logoContainerRef = useRef(null);

  const numberOfCards = logoContainerRef?.current?.childNodes?.length;
  const slider = logoContainerRef.current?.scrollWidth;

  useEffect(() => {
    if (numberOfCards > 7) {
      setScrollRight(false);
    } else {
      setScrollRight(true);
    }
  }, [numberOfCards]);
  function rightButton() {
    logoContainerRef.current.scrollLeft += 300;
    var div = logoContainerRef.current.scrollLeft;
    setScroll(div);
    if (slider / 3 - 300 <= scroll) {
      setScrollRight(true);
    }
  }
  function leftButton() {
    logoContainerRef.current.scrollLeft -= 300;
    var div = (logoContainerRef.current.scrollLeft -= 300);
    setScroll(div);
    setScrollRight(false);
    if (div === 0 || div < 0) {
      setScroll(null);
    }
  }
  return (
    <div className={classes}>
      <div className={css.title}>Our Trainers</div>

      <div id="slideLeft" onClick={e => leftButton()} className={css.left}>
        <BsArrowLeftCircle className={scroll === null ? css.logoDisbaled : css.logo} />
      </div>
      <div className={css.container} ref={logoContainerRef} id="logocontainer">
        {(trainers ?? [])?.map((trainer, index) => (
          <div key={index}>
            <img
              src={trainer.trainerProfileImage ? trainer.trainerProfileImage : image}
              style={{ width: '180px', borderRadius: '50%', height: '180px' }}
            />
            <h2 style={{ marginLeft: '35px' }} className={css.stepTitle}>
              {trainer.trainerName}
            </h2>
          </div>
        ))}
      </div>
      <div id="slideRight" onClick={e => rightButton()} className={css.right}>
        <BsArrowRightCircle className={scrollRight ? css.logoDisbaled : css.logo} />
      </div>
    </div>
  );
};

SectionTrainers.defaultProps = {
  rootClassName: null,
  className: null,
  currentUserListing: null,
  currentUserListingFetched: false,
};

SectionTrainers.propTypes = {
  rootClassName: string,
  className: string,
  currentUserListing: propTypes.ownListing,
  currentUserListingFetched: bool,
};

export default SectionTrainers;
