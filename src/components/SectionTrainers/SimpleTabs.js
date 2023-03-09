import React from 'react';
import { useHistory } from 'react-router-dom';
import { Tabs, Tab } from 'react-tabs-scrollable';
const SimpleTabs = props => {
  const { trainers = [], style, image, container } = props;
  const [activeTab, setActiveTab] = React.useState(1);
  const onTabClick = (e, index) => {
    setActiveTab(index);
  };
  const history = useHistory();
  // console.log(trainers);
  return (
    <Tabs
      activeTab={activeTab}
      onTabClick={onTabClick}
      tabsScrollAmount={3}
      animationDuration={300}
    >
      {trainers?.map((trainer, index) => (
        <Tab key={index}>
          {/* <img src={image} alt="amazon" className={imageStyle} key={index} /> */}
          <div className={container}>
            <img
              onClick={() => history.push(`/u/${trainer?.id?.uuid}`)}
              src={trainer.trainerProfileImage ? trainer.trainerProfileImage : image}
              style={{ width: '165px', borderRadius: '50%', height: '165px', cursor: 'pointer' }}
            />
            <h2 className={style}>{trainer.trainerName}</h2>
          </div>
        </Tab>
      ))}
    </Tabs>
  );
};

export default SimpleTabs;
