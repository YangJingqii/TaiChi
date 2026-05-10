const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

const badgeTemplates = [
  {
    badge_key: 'one_day',
    badge_name: '初练有成',
    target: 1
  },
  {
    badge_key: 'three_days',
    badge_name: '三日静心',
    target: 3
  },
  {
    badge_key: 'seven_days',
    badge_name: '一周有恒',
    target: 7
  },
  {
    badge_key: 'fourteen_days',
    badge_name: '半月入势',
    target: 14
  },
  {
    badge_key: 'twenty_one_days',
    badge_name: '三七成习',
    target: 21
  },
  {
    badge_key: 'thirty_days',
    badge_name: '月满有功',
    target: 30
  },
  {
    badge_key: 'sixty_days',
    badge_name: '两月不辍',
    target: 60
  },
  {
    badge_key: 'ninety_days',
    badge_name: '九旬有定',
    target: 90
  },
  {
    badge_key: 'hundred_days',
    badge_name: '百日入境',
    target: 100
  },
  {
    badge_key: 'half_year_days',
    badge_name: '半载从容',
    target: 180
  },
  {
    badge_key: 'year_days',
    badge_name: '四时不辍',
    target: 365
  },
  {
    badge_key: 'thousand_days',
    badge_name: '千日功深',
    target: 1000
  }
]

function calcLevel(current, target) {
  if (current < target) return 0
  return Math.max(1, Math.floor(current / target))
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const [albumDates, badgeRes] = await Promise.all([
    db.collection('album').where({ user_id: openid }).field({ date: true }).get(),
    db.collection('badges').where({ user_id: openid }).get()
  ])

  const uniqueDays = new Set(albumDates.data.map(item => item.date)).size
  const stats = {
    one_day: uniqueDays,
    three_days: uniqueDays,
    seven_days: uniqueDays,
    fourteen_days: uniqueDays,
    twenty_one_days: uniqueDays,
    thirty_days: uniqueDays,
    sixty_days: uniqueDays,
    ninety_days: uniqueDays,
    hundred_days: uniqueDays,
    half_year_days: uniqueDays,
    year_days: uniqueDays,
    thousand_days: uniqueDays
  }

  const results = await Promise.all(badgeTemplates.map(async template => {
    const current = stats[template.badge_key]
    const level = calcLevel(current, template.target)
    const exist = badgeRes.data.find(item => item.badge_key === template.badge_key)

    if (exist) {
      await db.collection('badges').doc(exist._id).update({
        data: {
          level,
          current,
          updated_at: db.serverDate()
        }
      })
      return {
        badge_key: template.badge_key,
        level,
        current
      }
    }

    const addRes = await db.collection('badges').add({
      data: {
        user_id: openid,
        badge_key: template.badge_key,
        badge_name: template.badge_name,
        level,
        current,
        updated_at: db.serverDate()
      }
    })

    return {
      id: addRes._id,
      badge_key: template.badge_key,
      level,
      current
    }
  }))

  return {
    ok: true,
    stats,
    badges: results
  }
}
