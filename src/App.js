import React, { useEffect, useState } from 'react'
import './App.scss'
import { items } from './sample-data'
import { getDefaultSelectedItemOptions, pickSelectionsForOptionGroup } from './helpers'
import classNames from 'classnames'
import Expand from 'react-expand-animated'

export const App = () => {
  const [openItem, setOpenItem] = useState(null)
  const [currentCodeSnippet, setCurrentCodeSnippet] = useState(null)

  const toggleExpanded = itemId => {
    setOpenItem(itemId)
  }

  return (
    <div className='App'>
      <div className='menu'>
        {items.map(item => <MenuItem
          expandItem={toggleExpanded}
          setCurrentCodeSnippet={setCurrentCodeSnippet}
          expanded={openItem === item.id}
          key={item.id}
          item={item} />)}
      </div>
      {currentCodeSnippet && <div className='code-snippet'>
        <code>
          <pre>{JSON.stringify(currentCodeSnippet, null, 2)}</pre>
        </code>
      </div>}
    </div>
  )
}

const MenuItem = ({ item, expanded, expandItem, setCurrentCodeSnippet }) => {
  const [currentSelections, setCurrentSelections] = useState(getDefaultSelectedItemOptions(item.option_groups))

  useEffect(() => {
    if (expanded) {
      setCurrentCodeSnippet(currentSelections)
    }
  }, [expanded, currentSelections])

  const handleOptionSelect = selectedOptions => {
    const newSelectedOptions = currentSelections.map(opt => {
      if (opt.id === selectedOptions.id) {
        return selectedOptions
      }
      return opt
    })
    setCurrentSelections(newSelectedOptions)
  }

  return (
    <div onClick={() => expandItem(item.id)}>
      <span className='item-name'>{item.name}</span>
      <Expand open={expanded}>
        {item.option_groups.map(optionGroup => <OptionGroup
          nested={false}
          key={optionGroup.id}
          onChange={handleOptionSelect}
          optionGroupSelections={pickSelectionsForOptionGroup(optionGroup, currentSelections)}
          optionGroup={optionGroup} />)}
      </Expand>
    </div>
  )
}

const OptionGroup = ({ optionGroup, optionGroupSelections, onChange, nested = true }) => {
  const {
    options: optionGroupSelectedOptions = []
  } = optionGroupSelections

  const handleSelect = optionGroup => (e, selectedOption) => {
    const isRadio = optionGroup.max_selectable === 1 && optionGroup.min_selectable === 1
    const newOptionGroup = { ...optionGroup }
    const newSelectedOption = { ...selectedOption }
    newSelectedOption.option_groups = getDefaultSelectedItemOptions(newSelectedOption.option_groups)
    newOptionGroup.options = isRadio
      ? [newSelectedOption]
      : e.target.checked
        ? [...optionGroupSelectedOptions, newSelectedOption]
        : optionGroupSelectedOptions.filter(opt => opt.id !== selectedOption.id)
    onChange(newOptionGroup)
  }

  const nestedHandleSelect = (optionId, parentSelectedOptions) => selectedOption => {
    const newParent = parentSelectedOptions.map(opt => {
      const newOpt = { ...opt }
      if (newOpt.id === optionId) {
        newOpt.option_groups = newOpt.option_groups.map(option => {
          let newOption = { ...option }
          if (newOption.id === selectedOption.id && newOption.name === selectedOption.name) {
            newOption = selectedOption
          }
          return newOption
        })
      }
      return newOpt
    })
    const newSelections = { ...optionGroupSelections }
    newSelections.options = newParent
    onChange(newSelections)
  }

  return (

    <div className={classNames('option-group', nested && 'nested')}>
      <div className='option-group-name'>{optionGroup.name}</div>
      <div className='options'>
        <OptionsList
          optionGroup={optionGroup}
          selectedOptions={optionGroupSelectedOptions}
          onChange={handleSelect(optionGroup)}
          onNestedChange={nestedHandleSelect}
        />
      </div>
    </div>

  )
}

const OptionsList = ({ optionGroup, selectedOptions, onChange, onNestedChange }) => {
  const isRadio = optionGroup.min_selectable === 1 && optionGroup.max_selectable === 1

  return (
    <>
      {optionGroup.options.map(option => {
        const isSelected = !!selectedOptions.find(opt => option.id === opt.id)
        return (
          <div key={option.id} className='option'>
            <div className={classNames('pretty p-smooth', isRadio && 'p-round p-default', !isRadio && 'p-svg')}>
              <input type={isRadio ? 'radio' : 'checkbox'}
                name={optionGroup.id}
                id={option.id}
                value={option.id}
                onChange={e => onChange(e, option)}
                checked={isSelected} />
              <div className='state p-default'>
                {!isRadio && <Check />}
                <label className={classNames(isSelected && 'selected')} htmlFor={option.id}>{option.name}</label>
              </div>
            </div>

            <Expand open={isSelected}>
              <div>
                {option.option_groups.map(og => {
                  const selOpts = selectedOptions.find(sel => sel.id === option.id)
                  return (<OptionGroup
                    key={og.id}
                    onChange={onNestedChange(option.id, selectedOptions)}
                    optionGroupSelections={selOpts ? pickSelectionsForOptionGroup(og, selOpts.option_groups) : []}
                    optionGroup={og}/>)
                })}
              </div>
            </Expand>
          </div>
        )
      })}
    </>
  )
}

const Check = () => {
  return (
    <svg className="svg svg-icon" viewBox="0 0 20 20">
      <path
        d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
        style={{ stroke: '#48E5C2', fill: '#48E5C2' }}>
      </path>
    </svg>)
}
