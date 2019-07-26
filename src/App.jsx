import React, {useEffect, useState} from 'react';
import axios from 'axios';

// import { debug } from './utils';

import('./css/library.css');
import('./css/wardrobe.css');

function App() {
  const [bottomId, setBottomId]             = useState(null);
  const [bottoms, setBottoms]               = useState([]);
  const [date, setDate]                     = useState(null);
  const [dayOfWeek, setDayOfWeek]           = useState(null);
  const [outfitId, setOutfitId]             = useState(null);
  const [showOutfitForm, setShowOutfitForm] = useState(false);
  const [topId, setTopId]                   = useState(null);
  const [tops, setTops]                     = useState([]);
  const [toWashBottom, setToWashBottom]     = useState(false);
  const [toWashTop, setToWashTop]           = useState(true);
  const [week, setWeek]                     = useState([]);

  useEffect(() => {
    getData(true);
  }, []);

  const getData = async (includeArticles = false) => {
    const response = await axios.get('https://www.rootbeercomics.com/api/wardrobe/get.php', {params: {includeArticles}});
    const today    = new Date();
    const tops     = [];
    const bottoms  = [];
    const week     = [];
    const days     = {};

    if (response) {
      response.data.outfits.results.forEach(outfit => {
        const previousSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const outfitDate     = new Date(outfit.date.replace(' ', 'T'));

        outfit.to_wash_bottom = outfit.to_wash_bottom === '1';
        outfit.to_wash_top    = outfit.to_wash_top === '1';

        if (outfitDate >= previousSunday) {
          outfit.dayOfWeek = outfitDate.getDay();
          days[outfit.dayOfWeek] = outfit;
        }
      });

      for (let i = 0; i < 7; i++) {
        if (days[i]) {
          week.push(days[i]);
        } else {
          week.push({dayOfWeek: i});
        }
      }

      if (response.data.articles) {
        response.data.articles.results.forEach(article => {
          if (article.is_top === '1') {
            tops.push(article);
          }

          if (article.is_bottom === '1') {
            bottoms.push(article);
          }
        });

        setBottoms(bottoms);
        setTops(tops);
      }

      setWeek(week);
    }
  };

  const getIcon = typeId => {
    let icon = 'fa-tshirt';

    switch (typeId) {
      case '1':
        icon = 'fa-usertie';
        break;
      case '2':
        icon = 'fa-chevron-down';
        break;
      case '3':
      default:
        icon = 'fa-tshirt';
        break;
    }

    return icon;
  };

  const upsertOutfit = () => {
    const data = {
      params: {
        bottomId,
        date,
        id: outfitId,
        topId,
        toWashBottom,
        toWashTop
      }
    };

    (async () => {
      (await axios.get('https://www.rootbeercomics.com/api/wardrobe/upsert.php', data).then(response => {
        if (response && response.data.success) {
          getData();
          setShowOutfitForm(false);
        }
      }))();
    })();
  };

  const handleAddOutfitClick = dayOfWeekClicked => {
    const today          = new Date();
    const previousSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const date           = new Date(previousSunday.getFullYear(), previousSunday.getMonth(), previousSunday.getDate() + dayOfWeekClicked);

    if (dayOfWeek && dayOfWeek === dayOfWeekClicked) {
      setDayOfWeek(null);
      setShowOutfitForm(false);
    } else {
      setBottomId(null);
      setDate(date);
      setDayOfWeek(dayOfWeekClicked);
      setOutfitId(null);
      setTopId(null);
      setToWashBottom(false);
      setToWashTop(true);
      setShowOutfitForm(true);
    }
  };

  const handleEditOutfitClick = outfit => {
    if (outfitId && outfit.id === outfitId) {
      setOutfitId(null);
      setShowOutfitForm(false);
    } else {
      setBottomId(outfit.bottom_id);
      setDate(outfit.date);
      setDayOfWeek(null);
      setOutfitId(outfit.id);
      setTopId(outfit.top_id);
      setToWashBottom(outfit.to_wash_bottom);
      setToWashTop(outfit.to_wash_top);
      setShowOutfitForm(true);
    }
  };

  const handleCancelClick = () => {
    setDayOfWeek(null);
    setOutfitId(null);
    setShowOutfitForm(false);
  };

  return (
    <div d="header" className="mAuto w600">
      <div className="flex spaceBetween alignCenter mb5 fs14">
        <div className="flex alignCenter mr10">
          <i aria-hidden={true} className={`mr10 fs14 fas fa-door-open csrPointer`} onClick={() => {window.location.reload()}}></i>
          <h1 className="fs14 bold csrPointer" onClick={() => {window.location.reload()}}>wardrobe</h1>
        </div>
      </div>
      <div id="week">
        <div className="flex mb5">
          <div className="day flex justifyCenter alignCenter mr5 bdrBlack opacity25">s</div>
          <div className="day flex justifyCenter alignCenter mr5 bdrBlack">m</div>
          <div className="day flex justifyCenter alignCenter mr5 bdrBlack">t</div>
          <div className="day flex justifyCenter alignCenter mr5 bdrBlack">w</div>
          <div className="day flex justifyCenter alignCenter mr5 bdrBlack">t</div>
          <div className="day flex justifyCenter alignCenter mr5 bdrBlack">f</div>
          <div className="day flex justifyCenter alignCenter mr5 bdrBlack opacity25">s</div>
        </div>
        <div className="flex mb5 bdrBox">
          {week.map((outfit, key) => {
            const isDisabled = dayOfWeek || (!outfitId && !dayOfWeek && (key === 0 || key === 6)) || (outfitId && outfitId !== outfit.id);
            const icon = getIcon(outfit.top_type_id);

            return (
              <React.Fragment key={key}>
                {outfit.top_hex && outfit.bottom_hex ? (
                  <div
                  className={`thumb flex justifyCenter alignCenter mr5 bdrBlack csrPointer ${isDisabled ? 'opacity25' : ''}`}
                  onClick={() => {handleEditOutfitClick(outfit)}}
                  style={{backgroundColor: outfit.bottom_hex}}
                  >
                    <i aria-hidden={true} className={`fs20 fas  ${icon}`} style={{color: outfit.top_hex}}></i>
                  </div>
                ) : (
                  <div
                  className={`thumb mr5 bdrBlack csrPointer ${outfitId || (dayOfWeek !== key) ? 'opacity25' : ''}`}
                  onClick={() => {handleAddOutfitClick(key)}}
                  >
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {showOutfitForm && (
        <div id="outfit" className="bdrBlackTop pt5">
          <div id="tops" className="flex mb5 bdrBox">
            {tops.map((top, key) => {
              const icon = getIcon(top.type_id);

              return (
                <div
                className={`thumb flex justifyCenter alignCenter mr5 bdrBlack csrPointer ${top.id === topId ? '' : 'opacity25'}`}
                key={key}
                onClick={() => {setTopId(top.id)}}
                >
                  <i aria-hidden={true} className={`fs20 fas ${icon}`} style={{color: top.hex}}></i>
                </div>
              );
            })}
          </div>
          <div id="bottoms" className="flex mb5 bdrBox">
            {bottoms.map((bottom, key) => {
              return (
                <div
                className={`thumb mr5 bdrBlack csrPointer ${bottom.id === bottomId ? '' : 'opacity25'}`}
                key={key}
                onClick={() => {setBottomId(bottom.id)}}
                style={{backgroundColor: bottom.hex}}
                />
              );
            })}
          </div>
          <div className="flex mb5">
            <input
            checked={toWashTop}
            className="mr5"
            id="toWashTop"
            name="toWashTop"
            onChange={event => {setToWashTop(event.target.checked)}}
            type="checkbox"
            />
            <label className="csrPointer" htmlFor="toWashTop">shirt in laundry?</label>
          </div>
          <div className="flex mb5">
            <input
            checked={toWashBottom}
            className="mr5"
            id="toWashBottom"
            name="toWashBottom"
            onChange={event => {setToWashBottom(event.target.checked)}}
            type="checkbox"
            />
            <label className="csrPointer" htmlFor="toWashBottom">pants/shorts in laundry?</label>
          </div>
          <div className="flex">
            <button
            className="mr5 bdrBlack p5 bgWhite csrPointer"
            onClick={upsertOutfit}
            type="button"
            >
              {outfitId ? 'update' : 'add'}
            </button>
            <button
            className="bdrBlack p5 bgWhite csrPointer"
            onClick={handleCancelClick}
            type="button"
            >
              cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
