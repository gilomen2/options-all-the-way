import React, { useState } from 'react'
import './App.css'
import { item } from './sample-data'
import { getDefaultSelectedItemOptions } from './helpers'

export const App = () => {
  return (
    <div className='App'>
      <MenuItem item={item} />
    </div>
  )
}

const MenuItem = ({ item }) => {
  const [currentSelections, setCurrentSelections] = useState(getDefaultSelectedItemOptions(item.option_groups))
  return (
    <>
      <span className='item-name'>{item.name}</span>
      {item.option_groups.map(optionGroup => <OptionGroup
        key={optionGroup.id}
        optionGroup={optionGroup} />)}
    </>
  )
}

const OptionGroup = ({ optionGroup }) => {
  return (
    <div className='option-group'>
      <div className='option-group-name'>{optionGroup.name}</div>
      <div className='options'>
        {optionGroup.options.map(option => {
          const isRadio = optionGroup.min_selectable === 1 && optionGroup.max_selectable === 1
          return (
            <div key={option.id}>
              <input type={isRadio ? 'radio' : 'checkbox'} name={optionGroup.id} id={option.id} value={option.id} />
              <label htmlFor={option.id}>{option.name}</label>
              {option.option_groups.map(og => <OptionGroup
                key={og.id}
                optionGroup={og} />)}
            </div>
          )
        })}
      </div>
    </div>

  )
}
