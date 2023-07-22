import { isValid } from 'date-fns'

const WEEK_DAYS = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
}

/**
 * @param {object} availableTime
 * @param {Array<string>} availableTime.weekDays
 * @param {Array<object>} availableTime.times
 * @param {Date} availableTime.times.start
 * @param {Date} availableTime.times.end
 */
export const validatePostAvailableTimeData = (availableTime) => {
  if (!availableTime.weekDays || !availableTime.times) {
    throw new Error('Missing required fields from available time data')
  }

  const validDays = Object.values(WEEK_DAYS)
  for (const weekDay of availableTime.weekDays) {
    if (!validDays.includes(weekDay)) {
      throw new Error(`Invalid ${weekDay} week day`)
    }
  }

  for (const time of availableTime.times) {
    if (
      !time.start ||
      !time.end ||
      !isValid(new Date(time.start)) ||
      !isValid(new Date(time.end))
    ) {
      throw new Error(`Invalid ${JSON.stringify(time)} time`)
    }
  }
}
