import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { ActivityFeed } from '../../components';

import css from './TransactionPanel.module.css';
import ExternalLink from '../ExternalLink/ExternalLink';
import IconSpinner from '../IconSpinner/IconSpinner';

// Functional component as a helper to build ActivityFeed section
const FeedSection = props => {
  const {
    className,
    rootClassName,
    currentTransaction,
    currentUser,
    fetchMessagesError,
    fetchMessagesInProgress,
    initialMessageFailed,
    messages,
    oldestMessagePageFetched,
    onShowMoreMessages,
    onOpenReviewModal,
    totalMessagePages,
    isProvider,
    isCustomer,
    joinUrl,
    startUrl,
    zoomLoading,
    zoomError,
    isSubscription,
    subscriptionId,
    transactionId,
    isPerMonth,
    isPerSession,
    isAccepted,
  } = props;
  console.log(isAccepted, 'isAccepted');
  const txTransitions = currentTransaction.attributes.transitions
    ? currentTransaction.attributes.transitions
    : [];
  console.log(txTransitions, 'txTransitions');
  const hasOlderMessages = totalMessagePages > oldestMessagePageFetched;

  const showFeed =
    messages.length > 0 || txTransitions.length > 0 || initialMessageFailed || fetchMessagesError;

  const classes = classNames(rootClassName || css.feedContainer, className);

  const hasCancelTransition = txTransitions.some(
    transition => transition.transition === 'transition/cancel'
  );

  // const txMetadata = currentTransaction?.attributes?.metadata ?? {};
  // const { join_url, start_url } = txMetadata;

  // joinUrl,
  //   startUrl,
  //   zoomLoading,
  //   zoomError,

  return showFeed ? (
    <div className={classes}>
      <h3 className={css.feedHeading}>
        <FormattedMessage id="TransactionPanel.activityHeading" />
      </h3>
      {initialMessageFailed ? (
        <p className={css.messageError}>
          <FormattedMessage id="TransactionPanel.initialMessageFailed" />
        </p>
      ) : null}
      {fetchMessagesError ? (
        <p className={css.messageError}>
          <FormattedMessage id="TransactionPanel.messageLoadingFailed" />
        </p>
      ) : null}
      <ActivityFeed
        className={css.feed}
        messages={messages}
        transaction={currentTransaction}
        currentUser={currentUser}
        hasOlderMessages={hasOlderMessages && !fetchMessagesInProgress}
        onOpenReviewModal={onOpenReviewModal}
        onShowOlderMessages={onShowMoreMessages}
        fetchMessagesInProgress={fetchMessagesInProgress}
      />

      {zoomError && <p className="text-base text-red-500 leading-snug">{zoomError}</p>}

      {zoomLoading && (
        <div className="flex items-center gap-4">
          <p className="my-0">Loading...</p>
          <IconSpinner className="w-6" />
        </div>
      )}

      {isProvider && startUrl ? (
        <div className="mt-4 w-full bg-marketplaceColor hover:bg-marketplaceColorDark transition duration-100 rounded shadow">
          <ExternalLink
            href={startUrl}
            className="block w-full h-full  py-2 text-center text-white hover:no-underline font-semibold tracking-wide"
          >
            Start Meeting
          </ExternalLink>
        </div>
      ) : null}
      {(isCustomer && joinUrl && (isSubscription && subscriptionId)) ||
      (isPerSession && transactionId && isAccepted) ? (
        <div className="mt-4 w-full  bg-marketplaceColor hover:bg-marketplaceColorDark transition duration-100 rounded shadow">
          <ExternalLink
            href={joinUrl}
            className="py-2 w-full h-full block text-center text-white hover:no-underline font-semibold tracking-wide"
          >
            Join Meeting
          </ExternalLink>
        </div>
      ) : null}
    </div>
  ) : null;
};

export default FeedSection;
