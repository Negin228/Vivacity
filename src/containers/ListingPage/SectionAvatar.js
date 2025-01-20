import React from 'react';
import { AvatarLarge, AvatarMedium, NamedLink } from '../../components'; // Imported NamedLink
import css from './ListingPage.module.css';

const SectionAvatar = props => {
  const { user } = props;
  const profileLink = user ? `/profile/${user.id?.uuid}` : '#'; // Constructed link to the profile page

  return (
    <div className={css.sectionAvatar}>
      <NamedLink name="ProfilePage" params={{ id: user.id.uuid }}>
        <AvatarLarge
          user={user}
          className={css.avatarDesktop}
          initialsClassName={css.initialsDesktop}
          disableProfileLink
        />
      </NamedLink>

      <NamedLink name="ProfilePage" params={{ id: user.id.uuid }}>
        <AvatarMedium user={user} className={css.avatarMobile} disableProfileLink />
      </NamedLink>
    </div>
  );
};

export default SectionAvatar;

