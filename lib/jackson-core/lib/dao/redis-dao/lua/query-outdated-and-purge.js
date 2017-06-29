export default (ripLastPersistedKey, upperLimitToPersist) =>
`
-- 1. Query all out of date records
local outOfDateRipKeys = redis.call("ZRANGEBYSCORE", "${ripLastPersistedKey}", "-inf", "${upperLimitToPersist}")
--
-- 2. If not null do the rest, else return.
if next(outOfDateRipKeys) ~= nil then
  --
  -- 4. delete out of date items
  redis.call("ZREM", "${ripLastPersistedKey}", unpack(updatedScoresInput))
  --
  -- 5. Get all rip values for out of date rip keys and return them.
  local outOfDateRips = redis.call("MGET", unpack(outOfDateRipKeys))
  --
  -- 6. Return the out of date rips
  return outOfDateRips
end
`;
