import React from 'react'
import L from '../../../config/languege'
import M from 'materialize-css'
import Button from '../../../global-components/layout/Button'
import axios from 'axios'
import API from '../../../config/API'

import { formObject, clearForm, getCurrentUserToken } from '../../../functions'
import SelectSearch from '../../../global-components/layout/SelectSearch'

export default class FilterCourseForm extends React.Component {
    constructor (props) {
        super(props)

        this.state = {
            courses: [],
            names: [],
            langueges: [],
            prices: [],
            quantity: [],
            reviews: [],
            init: false,
        }

        this.resetFilter = this.resetFilter.bind(this)
        this.parseSelect = this.parseSelect.bind(this)
        this.getDataSingle = this.getDataSingle.bind(this)
        this.initToggleFilters = this.initToggleFilters.bind(this)
    }

    getDataSingle () {
        const isSingle = this.props.isSingle;
        let dataSingle = {};

        const user_role = getCurrentUserToken('role');

        if(isSingle && (user_role < 2)) {
            dataSingle = {
                headers: {
                    'Authorization': getCurrentUserToken()
                }
            }
        }

        return dataSingle;
    }

    componentDidMount () {
        const dataSingle = this.getDataSingle()

        axios.get(`${API.host}/api/courses`, dataSingle).then(response => {
            const data = response.data;

            if(data.success) {
                const { names, authors, langueges, defaultLangueges } = data.data;
                this.setState(() => ({
                    names, authors, langueges, defaultLangueges
                }), () => this.initToggleFilters())
            }
        })
    }

    subForm (data) {
        const dataSingle = this.getDataSingle()
        axios.post(`${API.host}/api/courses`, data, dataSingle).then(response => {
            const data = response.data;
            if(data.success) {
                this.props.onUpdate( data.data )
            } else {
                this.props.onUpdate([], true)
                M.toast({ html: data.error_message, classes: 'red' })
            }
        })
    }

    parseSelect (form) {
        const globalFormData = formObject( document.getElementById(form) )
        self.globalFilterData = globalFormData
    }

    initToggleFilters () {
        this.setState(prevState => ({ init: !prevState.init }))
    }

    resetFilter (e, formId) {
        e.preventDefault();
        const form = document.getElementById(formId)

        this.props.onUpdate([], false)

        clearForm(form)
        self.globalFilterData = formObject(form)

        // ?????????????????? ???????? ??????????????????
        this.setState(() => ({ init: false }), 
            () => this.setState(() => ({
                init: true
            }))
        )
    }

    render() {
        // ???????????????? ?????????????????????? ?? ??????????-????????????, ?????? ???????????????? ???????? ?????? ?????????? ?????????????????? ???? ??????????????
        const { isSingle, isMobile } = this.props

        const f_ID = "filter-form-courses"

        // ?????????????? ?????????? (???????????? ?????? ??????????-???????????? ?? ?????? ???????????????? ????????????????)
        const _content = {
            change_c: (isSingle) ? '???????????????? ????????' : __e.f('filter_change_course', '???????????? ?????????????? - ???????????????? ????????'),
            change_a: (isSingle) ? '???????????????? ????????????' : __e.f('filter_change_author', '???????????? ?????????????? - ???????????????? ????????????'),
            change_l: (isSingle) ? '???????????????? ????????': __e.f('filter_change_lang', '???????????? ?????????????? - ???????????????? ????????'),
            clear_filter_btn: (isSingle) ? '????????????????' : __e.f('button_filter_form', '???????????? ???????????? ??????????????'),
            change_category_name: (isSingle) ? '???????????????? ??????????????????' : __e.f('category_name', '?????????????????? ??????????'),
            search_btn: (isSingle) ? '??????????' : __e.f('button_search_name', '???????????? ????????????')
        }

        return (
            <div className="Tsds-english__application__filter">
                { this.state.init ?
                    <form action="" id={f_ID} onSubmit={e => {
                        e.preventDefault();
                        this.subForm( formObject( e.target ) )
                    }}>
                        <div className="row flex-start-start">
                            <div className="input-field col s12 m3">
                                <p className="small__subheading">{_content.change_c}</p>
                                <SelectSearch
                                    onChange={() => this.parseSelect(f_ID)}
                                    placeholder={''}
                                    name={'name'}
                                    value={''}
                                    dataOnMap={this.state.names}
                                    onMapItems={(item, i) => {
                                        return <option key={i} value={item}>{item}</option>
                                    }}
                                />
                            </div>

                            <div className="input-field col s12 m3">
                                <p className="small__subheading">{_content.change_category_name}</p>
                                <SelectSearch
                                    onChange={() => this.parseSelect(f_ID)}
                                    placeholder={''}
                                    name={'category_name'}
                                    value={''}
                                    dataOnMap={API.categories_courses}
                                    onMapItems={(item, i) => {
                                        return <option key={i} value={item.value}>{item.title}</option>
                                    }}
                                />
                            </div>

                            <div className="input-field col s12 m3">
                                <p className="small__subheading">{_content.change_a}</p>
                                <SelectSearch
                                    onChange={() => this.parseSelect(f_ID)}
                                    placeholder={''}
                                    name={'author'}
                                    value={''}
                                    dataOnMap={this.state.authors}
                                    onMapItems={(item, i) => {
                                        return <option key={i} value={item}>{item}</option>
                                    }}
                                />
                            </div>

                            <div className="input-field col s12 m3">
                                <p className="small__subheading">{_content.change_l}</p>
                                <SelectSearch
                                    onChange={() => this.parseSelect(f_ID)}
                                    placeholder={''}
                                    name={'langueges'}
                                    value={''}
                                    dataOnMap={this.state.langueges}
                                    onMapItems={(item, i) => {
                                        if(this.state.defaultLangueges[item]) {
                                            return <option key={i} value={item}>{this.state.defaultLangueges[item].languege}</option>
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="row flex-start-start">
                            <div className="input-field col s12">
                                <div className="Tsds-english__application__filter__reset">
                                    <Button submit customClass={'btn-new btn-new--green'} color={'#ffffff'} title={_content.search_btn} />
                                    <a href="" className="btn-new btn-new--grey" onClick={e => {
                                        this.resetFilter(e, f_ID)
                                    }}>{_content.clear_filter_btn}</a>
                                </div>
                            </div>
                        </div>
                    </form> : ''
                }
            </div>
        )
    }
}
