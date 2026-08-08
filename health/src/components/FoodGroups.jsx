import styles from './FoodGroups.module.css'
import { groupFoodsByCategory } from '../service/nutritionService'

/**
 * 추천 음식을 식품군(육류·해산물·채소류·견과류…)으로 묶어 보여 준다.
 * 막대는 그 군에 몇 가지가 추천됐는지를 나타낸다.
 * 이모지·이미지를 쓰지 않고 CSS 만으로 그린다
 */
export default function FoodGroups({ foods }) {
  const groups = groupFoodsByCategory(foods)

  if (groups.length === 0) return null

  const max = groups[0].foods.length

  return (
    <div className={styles.wrap}>
      {groups.map((group, index) => (
        <div
          className={styles.group}
          key={group.key}
          style={{ '--c': `var(--${group.tone})`, '--i': index }}
        >
          <div className={styles.head}>
            <span className={styles.dot} />
            <span className={styles.label}>{group.label}</span>
            <span className={styles.count}>{group.foods.length}가지</span>
          </div>

          <div className={styles.track}>
            <span
              className={styles.fill}
              style={{ '--w': `${(group.foods.length / max) * 100}%` }}
            />
          </div>

          <div className={styles.chips}>
            {group.foods.map((food, foodIndex) => (
              <span className={styles.chip} key={food.name} style={{ '--j': foodIndex }}>
                {food.name}
                <span className={styles.chipTag}>{food.nutrients.join('·')}</span>
              </span>
            ))}
          </div>
        </div>
      ))}

      <p className={styles.legendNote}>
        막대는 그 식품군에서 추천된 가짓수입니다. 한 가지에 몰지 말고 군을 고루 섞는
        편이 좋습니다.
      </p>
    </div>
  )
}
