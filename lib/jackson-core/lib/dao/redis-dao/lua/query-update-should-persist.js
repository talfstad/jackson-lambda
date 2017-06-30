export default (rip, ripLastPersistedKey, upperLimitToPersist, newTime) =>
`
-- 1. Get this rip's score
local score = tonumber(redis.call("ZSCORE", "${ripLastPersistedKey}", "${rip.url}"))
--
-- 2. If undefined or out of date return. Is score out of date?
if score == nil or score < ${upperLimitToPersist} then
  --
  -- score is out of date. update it.
  redis.call("ZADD", "${ripLastPersistedKey}", ${newTime}, "${rip.url}")
  return true;
else
  return false
end
`;
