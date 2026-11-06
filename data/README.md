# Ratings data

Jack's and Floss's ratings from each round, one row per name, in the order the names were shown.

| File | Names | Columns | Rating scale |
| --- | --- | --- | --- |
| `round-1.csv` | 87 | `Name,Jack,Floss` | `Like`, `Meh`, `Don't like` |
| `round-2.csv` | 35 | `Name,Jack,Floss` | `Love`, `Like`, `Meh` |

## How each round was built

- **Round 1** was the original 87-name list in `names.js` (see the repo history before the round 2 commit).
- **Round 2** was every round 1 name that neither of you rated `Don't like`: 35 names. The other 52 were cut (16 by both of you, 20 by Jack alone, 16 by Floss alone).
- Round 2 dropped `Don't like` and added `Love`, so a round 1 `Like` and a round 2 `Like` aren't quite the same thing.

## Sources

Each file merges the two exports from that round:

- Round 1: Jack `baby-name-ratings.csv`, Floss `baby-name-ratings.xlsx`
- Round 2: Jack `baby-name-ratings-round-2.csv`, Floss `baby-name-ratings-round-2.xlsx`

Names and order matched exactly between Jack's and Floss's files in both rounds.
