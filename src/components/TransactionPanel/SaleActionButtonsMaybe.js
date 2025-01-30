import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { PrimaryButton, SecondaryButton } from '../../components';
import moment from 'moment';
import css from './TransactionPanel.module.css';

// Functional component as a helper to build ActionButtons for
// provider when state is preauthorized
const SaleActionButtonsMaybe = props => {
  const {
    className,
    rootClassName,
    showButtons,
    acceptInProgress,
    declineInProgress,
    acceptSaleError,
    declineSaleError,
    onAcceptSale,
    onDeclineSale,
    listing,
    currentTransaction,
  } = props;
  const { attributes } = listing || {};
  const { publicData } = attributes || {};
  const { startDate: lStartDate } = publicData || {};
  const currentTimezone = moment.tz.guess();
  const transactionMetadata = currentTransaction?.attributes?.metadata || {};
  const { providerTime } = transactionMetadata;
  const startDate = moment.tz(providerTime || lStartDate, currentTimezone);
  const currentDate = moment.tz(new Date(), currentTimezone);
  // console.log('dates--------------->', {
  //   currentDate: currentDate.format('YYYY-MM-DD HH:mm a'),
  //   startDate: startDate.format('YYYY-MM-DD HH:mm a'),
  // });
  const isPast = startDate.isBefore(currentDate);
  const buttonsDisabled = acceptInProgress || declineInProgress;

  const acceptErrorMessage = acceptSaleError ? (
    <p className={css.actionError}>
      {acceptSaleError?.message ? (
        acceptSaleError?.message
      ) : (
        <FormattedMessage id="TransactionPanel.acceptSaleFailed" />
      )}
    </p>
  ) : null;
  const declineErrorMessage = declineSaleError ? (
    <p className={css.actionError}>
      <FormattedMessage id="TransactionPanel.declineSaleFailed" />
    </p>
  ) : null;

  const classes = classNames(rootClassName || css.actionButtons, className);

  return showButtons ? (
    <div className={classes}>
      <div className={css.actionErrors}>
        {acceptErrorMessage}
        {declineErrorMessage}
      </div>
      <div className={css.actionButtonWrapper}>
        <SecondaryButton
          inProgress={declineInProgress}
          disabled={buttonsDisabled}
          onClick={onDeclineSale}
        >
          <FormattedMessage id="TransactionPanel.declineButton" />
        </SecondaryButton>
        {isPast ? null : (
          <PrimaryButton
            inProgress={acceptInProgress}
            disabled={buttonsDisabled}
            onClick={onAcceptSale}
          >
            <FormattedMessage id="TransactionPanel.acceptButton" />
          </PrimaryButton>
        )}
      </div>
    </div>
  ) : null;
};

export default SaleActionButtonsMaybe;
