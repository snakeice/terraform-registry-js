"use strict";

import octokit from "octokit";

function getOctokit() {
    let token = process.env.TOKEN;
    let octo = new octokit.Octokit({
        auth: token,
    });
    return octo;
}

export function getReleases(owner, repo) {
  let octo = getOctokit();
  return octo.request("GET /repos/{owner}/{repo}/releases", {
    owner: owner,
    repo: repo,
  });
}

export function getRelease(owner, repo, version) {
  let octo = getOctokit();

  return getReleases(owner, repo).then(function (releases) {
    let release = releases.data.find(function (release) {
      return release.tag_name === version;
    });

    if (release) {
      return octo.request("GET /repos/{owner}/{repo}/releases/{id}", {
        owner: owner,
        repo: repo,
        id: release.id,
      });
    } else {
      return Promise.reject(new Error(`Release ${version} not found`));
    }
  });
}

export function getDownloadUrl(release, os, arch) {
  let asset = release.data.assets.find(function (asset) {
    return asset.name.endsWith(`_${os}_${arch}.zip`);
  });
  return asset.browser_download_url;
}


export function getShasumsUrl(release) {
    let SHA256SUMS = release.data.assets.find(function (asset) {
        return asset.name.endsWith("SHA256SUMS");
    }); 
    return SHA256SUMS.browser_download_url;
}

export function getShasumsSignatureUrl(release) {
    let SHA256SUMS = release.data.assets.find(function (asset) {
        return asset.name.endsWith("SHA256SUMS.sig");
    });

    return SHA256SUMS.browser_download_url;
}