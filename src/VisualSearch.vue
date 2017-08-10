<template>
	<div class="vis-field clearfix" :class="{'-active':active}" @click="activate" ref="container">
		<a class="vis-value" href="javascript:void(0)" v-for="(item,index) in values" @click="removeValue(index,$event)">
			<i class="glyphicon glyphicon-remove-circle"></i>
			{{item.type}}: {{item.value}}
		</a>
		<div class="vis-field-input-container" v-if="active">
			<input type="text" class="vis-field-input" v-model="input.query" :style="{width:fixedInputWidth+'px'}" @keydown="processDropdownNavigation" @keypress="updateInputWidth" @keyup="processInputBackspace" ref="input">
			<span class="vis-field-input-measurer" ref="inputMeasurer"></span>
			<ul class="list-group vis-field-input-dropdown" v-if="dropdownItems.length>0" :style="{width:dropdown.width+'px'}">
				<li class="list-group-item" v-for="(item,index) in dropdownItems" :class="{active:index==dropdown.index}" @click="selectDropdownOption(index)" @mouseover="setDropdownIndex(index)">
					{{item}}
				</li>
			</ul>
		</div>
		<div class="vis-field-input-placeholder" v-else>
			{{input.query}}
		</div>
	</div>
</template>

<script>

export default {
	props: ["settings","change"],
	data: function() {
		return {
			active: false,
			input: {
				query: "",
				width: 0
			},
			dropdown: {
				type: undefined,
				index: undefined,
				width: 100,
			},
			values: []
		}
	},
	watch: {
		active: function(active) {
			if (active) {
				this.setInputFocus();
			}
		},
		dropdownItems: function(newItems,oldItems) {
			console.log("dropdownItems",oldItems.length,newItems.length);
			if (oldItems.length==0 && newItems.length>0) {
				this.dropdown.index = 0;
			}
			else if (newItems.length>0 && this.dropdown.index+1>newItems.length) {
				this.dropdown.index = newItems.length-1;
			}
		},
		values: function(values) {
			this.$emit("change",values);
		}
	},
	computed: {
		fixedInputWidth: function() {
			return Math.max(this.input.width,this.dropdown.width) + 2; // 2px is the input border width;
		},
		dropdownItems: function() {
			const out = [];
			const query = this.input.query.toLowerCase();
			let options = [];
			if (this.dropdown.type && this.settings.hasOwnProperty(this.dropdown.type)) {
				options = this.settings[this.dropdown.type];
			}
			else if (this.active) {
				options = _.keys(this.settings).sort();
			}
			options.forEach((str) => {
				if (str.toLowerCase().indexOf(query)!==-1) {
					out.push(str);
				}
			});
			return out;
		}
	},
	methods: {
		activate: function(e) {
			e.stopPropagation();
			this.active = true;
		},
		updateInputWidth: function(e) {
			if (e.which && e.charCode) {
				const c = String.fromCharCode(e.keyCode||e.charCode);
				$(this.$refs.inputMeasurer).text(this.input.query+c);
				this.input.width = $(this.$refs.inputMeasurer).width();
				console.log(this.input.width);
			}
		},
		processInputBackspace: function(e) {
			if (e.keyCode==8 || e.keyCode==46) {
				$(this.$refs.inputMeasurer).text(this.input.query);
				this.input.width = $(this.$refs.inputMeasurer).width();
			}
		},
		processDropdownNavigation: function(e) {
			if (e.keyCode==38 || e.keyCode==40) {
				e.preventDefault();
				e.stopPropagation();
				const total = this.dropdownItems.length;
				if (total==0) return;
				const direction = (e.keyCode==38?-1:1);
				let index = this.dropdown.index;
				if (index===0 || index>0) {
					index += direction;
					while (index<0) index += total;
					while (index+1>total) index -= total;
				}
				else {
					index = (direction==1?0:total-1);
				}
				this.dropdown.index = index;
			}
			else if (e.keyCode==13) {
				e.preventDefault();
				e.stopPropagation();
				this.selectDropdownOption(this.dropdown.index);
			}
			else if (e.keyCode==27 || e.keyCode==9) {
				this.active = false;
			}
		},
		setDropdownIndex: function(index) {
			this.dropdown.index = index;
		},
		selectDropdownOption: function(index) {
			if ((index===0 || index>0) && index<this.dropdownItems.length) {
				if (this.dropdown.type && this.settings.hasOwnProperty(this.dropdown.type)) {
					this.values.push({
						type: this.dropdown.type,
						value: this.dropdownItems[index]
					});
					this.input.query = "";
					this.dropdown.type = undefined;
					this.dropdown.index = 0;
				}
				else {
					this.dropdown.type = this.dropdownItems[index];
					this.dropdown.index = 0;
					this.input.query = "";
				}
			}
		},
		removeValue: function(index,e) {
			e.stopPropagation();
			this.values.splice(index,1);
			if (this.active) {
				this.setInputFocus();
			}
		},
		setInputFocus: function() {
			this.$nextTick(() => {
				$(this.$refs.input).focus();
			});
		}
	},
	mounted: function() {
		this._blur = (e) => {
			this.active = false;
		}
		$(window).on("click",this._blur);
	},
	beforeDestroy: function() {
		this._blur && $(window).off("click",this._blur);
	}
}

</script>

<style lang="scss">
	.vis {
		&-field {
			position: relative;
			border: 1px solid #dedede;
			border-radius: 5px;
			background-color: #ffffff;
			min-height: 37px;
			&.-active {
				border-color: #66afe9;
			    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);
			}
			&-input-container {
				position: relative;
				display: block;
				float: left;
			}
			&-input {
				border: 0;
				padding: 0;
				margin: 5px;
				height: 25px;
				display: inline-block;
				&:focus {
					outline: none;
				}
				&:first-line {
					display: inline-block;
				}
				&-measurer {
					white-space: pre;
					display: none;
				}
				&-dropdown {
					position: absolute;
					top: 100%;
					left: 0;
				}
				&-placeholder {
					display: block;
					float: left;
					height: 25px;
					margin: 5px;
					line-height: 25px;
				}
			}
		}
		&-value {
			display: block;
			float: left;
			height: 25px;
			margin: 5px;
			line-height: 21px;
			padding: 2px 5px;
			background-color: #dedede;
			border-radius: 2px;
			&:hover,&:focus {
				text-decoration: none;
			}
			.glyphicon {
				position: relative;
				top: 2px;
			}
		}
	}
</style>