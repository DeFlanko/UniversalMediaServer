/*
 * This file is part of Universal Media Server, based on PS3 Media Server.
 *
 * This program is a free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; version 2 of the License only.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */
package net.pms.media;

import net.pms.util.Iso639;
import org.apache.commons.lang3.StringUtils;

/**
 * This class keeps track of the language information for subtitles or audio.
 */
public abstract class MediaLang {
	public static final String UND = "und";
	private int id;
	protected String lang;

	/**
	 * A special ID value that indicates that the instance is just a placeholder
	 * that shouldn't be used.
	 */
	public static final int DUMMY_ID = Integer.MIN_VALUE;

	/**
	 * Returns the full language name for an audio or subtitle track based on a
	 * translation from the ISO 639 language code. If no code has been set,
	 * "Undetermined" is returned.
	 *
	 * @return The language name
	 * @since 1.50
	 */
	public String getLangFullName() {
		if (StringUtils.isNotBlank(lang)) {
			return Iso639.getFirstName(lang);
		}
		return Iso639.getFirstName(MediaLang.UND);
	}

	public boolean matchCode(String code) {
		return Iso639.isCodesMatching(lang, code);
	}

	/**
	 * Returns the unique id for this language object
	 *
	 * @return The id.
	 * @since 1.50
	 */
	public int getId() {
		return id;
	}

	/**
	 * Sets a unique id for this language object.
	 *
	 * @param id the id to set.
	 * @since 1.50
	 */
	public void setId(int id) {
		this.id = id;
	}

	/**
	 * Returns the IS0 639 language code for this language object. If you
	 * require the full language name, use {@link #getLangFullName()} instead.
	 * Special return values are "und" (for "undetermined") and "off"
	 * (indicates an audio track or subtitle should be disabled).
	 *
	 * @return The language code.
	 * @since 1.50
	 */
	public String getLang() {
		return lang;
	}

	/**
	 * Sets the ISO 639 language code for this language object. Special values
	 * are "und" (for "undetermined") and "off" (indicates an audio track or
	 * subtitle should be disabled).
	 *
	 * @param lang The language code to set.
	 * @since 1.50
	 */
	public void setLang(String lang) {
		this.lang = lang;
	}
}
