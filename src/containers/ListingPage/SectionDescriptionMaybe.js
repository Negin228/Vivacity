import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { richText } from '../../util/richText';
import { MdOutlineDescription } from 'react-icons/md';
import { IoLanguage } from 'react-icons/io5';
import css from './ListingPage.module.css';

const MIN_LENGTH_FOR_LONG_WORDS_IN_DESCRIPTION = 20;

const SectionDescriptionMaybe = props => {
  const { description, languages } = props;
  // console.log(languages);
  return description ? (
    <div className={css.sectionDescription}>
      <h2 className={css.descriptionTitle}>
        <MdOutlineDescription style={{ marginRight: '10px' }} />
        <FormattedMessage id="ListingPage.descriptionTitle" />
      </h2>
      <p className={css.description}>
        {richText(description, {
          longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS_IN_DESCRIPTION,
          longWordClass: css.longWord,
        })}
      </p>
      <h2 className={css.descriptionTitle} style={{ marginTop: '16px' }}>
        <IoLanguage style={{ marginRight: '10px' }} />
        Language
      </h2>
      <p className={css.description}>{languages?.label}</p>
    </div>
  ) : null;
};

export default SectionDescriptionMaybe;
