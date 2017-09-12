import Man from './man'

Errors =
  betaName: ->
    """
    You shouldn't include 'beta' in your release name, I'll append it myself
    Eg: 'Olive Seagull Violet' -> 'Olive Seagull Violet beta'
    """
  default: (msg) ->
    msg
  mandatoryArg: (arg) ->
    """
    I won't work without <#{arg}> ;(

    #{Man}
    """
  mergeApocalypse: (head, base) ->
    "I won't let you merge `#{head}` into `#{base}`!"
  noNewPR: (head, base) ->
    return "No new PR is added by merging #{head} into #{base}"
  unmergeable: (number) ->
    "The PR ##{number} isn't ready for merge"
  tooManyTries: (count) ->
    "I've tried #{count} times, I'm tired"

export default Errors
