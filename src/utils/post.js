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
 * @param {Array<string>} availableTimes
 */
export const validatePostAvailableTimesData = (availableTimes) => {
  if (!availableTimes) {
    throw new Error('Missing required fields from available time data')
  }

  const validDays = Object.values(WEEK_DAYS)
  for (const weekDay of availableTimes) {
    if (!validDays.includes(weekDay)) {
      throw new Error(`Invalid ${weekDay} week day`)
    }
  }
}
