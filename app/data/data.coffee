App.data = {}
App.data.null = null
App.data.empty = []

# one value factor
require 'build/app/data/single_group/asset_values'
require 'build/app/data/single_group/many_values'
require 'build/app/data/single_group/high_net_worth_duration'
require 'build/app/data/single_group/single_sector_return'

require 'build/app/data/single_group/one_value'
require 'build/app/data/single_group/two_values'
require 'build/app/data/single_group/zero'
require 'build/app/data/single_group/zeroes'
require 'build/app/data/single_group/sum_to_zero'
require 'build/app/data/single_group/bad_range'

# one value factor, one grouping factor
require 'build/app/data/multi_group/two_ranges'
require 'build/app/data/multi_group/three_ranges'
require 'build/app/data/multi_group/five_ranges'
require 'build/app/data/multi_group/sector_compare_return'

# two value factors, one grouping factor
require 'build/app/data/multi_value/sepals'
require 'build/app/data/multi_value/grouped_money'
require 'build/app/data/multi_value/grouped_percent'
require 'build/app/data/multi_value/ungrouped_money'
require 'build/app/data/multi_value/ungrouped_percent'
require 'build/app/data/multi_value/grouped_zero'
require 'build/app/data/multi_value/grouped_zeroes'
require 'build/app/data/multi_value/ungrouped_zero'
require 'build/app/data/multi_value/ungrouped_zeroes'

# single time series
require 'build/app/data/time_series/daily_curr_value'
require 'build/app/data/time_series/daily_diff_value'
require 'build/app/data/time_series/daily_two_series'
require 'build/app/data/time_series/daily_three_series'
require 'build/app/data/time_series/daily_four_series'
require 'build/app/data/time_series/daily_five_series'
require 'build/app/data/time_series/daily_six_series'
require 'build/app/data/time_series/value_p1d_p1y'
require 'build/app/data/time_series/value_p1m_p1y'
require 'build/app/data/time_series/value_p1m_p2y'
require 'build/app/data/time_series/value_p1m_p5y'
require 'build/app/data/time_series/value_p1w_p1y'
require 'build/app/data/time_series/zeroes_ungrouped'
require 'build/app/data/time_series/same_value_ungrouped'

# multiple time series
require 'build/app/data/time_series/monthly_return_single_series'
require 'build/app/data/time_series/monthly_return_double_series'
require 'build/app/data/time_series/monthly_return_triple_series'
require 'build/app/data/time_series/monthly_return_single_period'
require 'build/app/data/time_series/monthly_return_double_period'
require 'build/app/data/time_series/monthly_return_negative_period'
require 'build/app/data/time_series/population'
require 'build/app/data/time_series/zeroes_grouped'
require 'build/app/data/time_series/same_value_grouped'

# bubble chart data
require 'build/app/data/bubble/default'
