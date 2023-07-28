import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { PropertyGroup } from '../../components';
import moment from 'moment';
import css from './ListingPage.module.css';
import { CgGym } from 'react-icons/cg';
import { MdDateRange, MdAccessTime } from 'react-icons/md';
import config from '../../config';
// import moment from 'moment';
import 'moment-timezone';
import { convertTime } from '../../util/urlHelpers';
const SectionFeaturesMaybe = props => {
  const { options, publicData } = props;
  if (!publicData) {
    return null;
  }
  const selectedOptions = publicData && publicData.yogaStyles ? publicData.yogaStyles : [];
  const otherWorkoutType = publicData?.otherWorkoutType;
  const selectedConfigOptions = config.custom.workoutTypesListing.filter(o =>
    selectedOptions.find(s => s === o.key)
  );

  // ;
  const targetTime = convertTime(publicData.startDate, publicData.timezone);
  const formattedDate = moment(publicData.startDate)
    .tz(publicData.timezone, true)
    .local()
    .format('dddd, MMMM Do YYYY, h:mm a');
  return (
    <div className={css.sectionFeatures}>
      <h2 className={css.featuresTitle}>
        <CgGym style={{ marginRight: '10px' }} />
        Workouts
      </h2>

      <PropertyGroup
        id="ListingPage.yogaStyles"
        options={[
          ...selectedConfigOptions,
          otherWorkoutType
            ? {
                key: 'other',
                label: otherWorkoutType,
              }
            : {},
        ]}
        selectedOptions={[...selectedOptions, otherWorkoutType ? 'other' : '']}
        twoColumns={selectedConfigOptions.length > 5}
      />
      <h2 className={css.featuresTitle} style={{ marginTop: '16px' }}>
        <MdDateRange style={{ marginRight: '10px' }} />
        Start Date
      </h2>
      <p>{targetTime}</p>
      {/* <p>{formattedDate}</p> */}
      <h2 className={css.featuresTitle} style={{ marginTop: '16px' }}>
        <MdAccessTime style={{ marginRight: '10px' }} />
        Class Duration
      </h2>
      <p>{publicData.classDuration?.label}</p>
    </div>
  );
};

export default SectionFeaturesMaybe;
