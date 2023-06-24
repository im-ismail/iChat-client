const active = (ms) => {
    const cms = new Date().getTime();
    const diffInSec = Math.floor((cms - ms) / 1000);

    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;

    const diffInWeeks = Math.floor(diffInSec / week);
    const diffInDays = Math.floor(diffInSec / day);
    const diffInHours = Math.floor(diffInSec / hour);
    const diffInMinutes = Math.floor(diffInSec / minute);

    // Define the text format for each unit
    const weekText = `${diffInWeeks}w`;
    const dayText = `${diffInDays}d`;
    const hourText = `${diffInHours}h`;
    const minuteText = `${diffInMinutes}m`;
    const secondText = `${diffInSec}s`;

    // Choose the appropriate text based on the elapsed time
    let lastSeenText = '';
    if (diffInWeeks > 0) {
        lastSeenText = weekText;
    } else if (diffInDays > 0) {
        lastSeenText = dayText;
    } else if (diffInHours > 0) {
        lastSeenText = hourText;
    } else if (diffInMinutes > 0) {
        lastSeenText = minuteText;
    } else {
        lastSeenText = secondText;
    };

    return `Active ${lastSeenText} ago`;
};

const lastSeen = (ms) => {
    const activeOn = new Date(ms);
    let date = activeOn.getDate();
    date = date < 10 ? '0' + date : date;
    let month = activeOn.getMonth();
    month = month < 9 ? '0' + (month + 1) : month + 1;
    const year = activeOn.getFullYear();

    let hours = activeOn.getHours();
    hours = hours < 10 ? '0' + hours : hours;
    let minutes = activeOn.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;

    const activeTime = hours + ':' + minutes;
    const activeDate = date + '/' + month + '/' + year;

    const currentDate = new Date();
    let todaysDate = currentDate.getDate();
    let YesterdaysDate = todaysDate - 1;
    todaysDate = todaysDate < 10 ? '0' + todaysDate : todaysDate;
    YesterdaysDate = YesterdaysDate < 10 ? '0' + YesterdaysDate : YesterdaysDate;
    let currentMonth = currentDate.getMonth();
    currentMonth = currentMonth < 9 ? '0' + (currentMonth + 1) : currentMonth + 1;
    let currentyear = currentDate.getFullYear();
    const today = todaysDate + '/' + currentMonth + '/' + currentyear;
    const yesterday = YesterdaysDate + '/' + currentMonth + '/' + currentyear;

    let lastSeenText = '';

    if (activeDate === today) {
        lastSeenText = `today at ${activeTime}`;
    } else if (activeDate === yesterday) {
        lastSeenText = `yesterday at ${activeTime}`;
    } else {
        lastSeenText = `${activeDate} at ${activeTime}`;
    };
    return `Last seen ${lastSeenText}`;
};

export default lastSeen;